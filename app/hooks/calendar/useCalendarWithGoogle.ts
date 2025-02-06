import { useState, useEffect, MutableRefObject } from "react";
import {
  EventApi,
  DateSelectArg,
  EventClickArg,
  CalendarApi,
} from "@fullcalendar/core";
import {
  CalendarEvent,
  SelectedDates,
  GoogleCalendarState,
} from "@/app/types/calendar";
import { createEventId } from "@/app/utils/calendar";
import * as googleCalendarService from "@/app/services/google-calendar";

export function useCalendarWithGoogle(
  accessToken?: string,
  calendarApiRef?: MutableRefObject<CalendarApi | null>
) {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [selectedDates, setSelectedDates] = useState<SelectedDates | null>(
    null
  );
  const [googleState, setGoogleState] = useState<GoogleCalendarState>({
    isConnected: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (accessToken) {
      setGoogleState((prev) => ({ ...prev, isConnected: true }));
    }
  }, [accessToken]);

  const handleEvents = (events: EventApi[]) => {
    setCurrentEvents(events);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDates({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      view: selectInfo.view,
    });
  };

  const handleCreateEvent = async (
    title: string,
    selectedTime: string,
    isAllDay: boolean
  ) => {
    const api = calendarApiRef?.current;
    if (!selectedDates || !api) return;

    try {
      setGoogleState((prev) => ({ ...prev, isLoading: true }));

      let startDate = new Date(selectedDates.start);
      let endDate = new Date(selectedDates.end);

      // Ensure valid dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date values:", {
          start: selectedDates.start,
          end: selectedDates.end,
        });
        throw new Error("Invalid date values");
      }

      if (!isAllDay) {
        const [hours, minutes] = selectedTime.split(":").map(Number);

        startDate = new Date(startDate.setHours(hours, minutes, 0, 0));
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      } else {
        startDate = new Date(startDate.setHours(0, 0, 0, 0));
        endDate = new Date(endDate.setHours(23, 59, 59, 999));
      }

      const newEvent: CalendarEvent = {
        id: selectedEvent?.id || createEventId(),
        title,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: isAllDay,
        googleEventId: selectedEvent?.extendedProps?.googleEventId,
      };
      if (newEvent.googleEventId) {
        await googleCalendarService.updateEvent(newEvent);
      } else {
        const googleEventId = await googleCalendarService.createEvent(newEvent);
        newEvent.googleEventId = googleEventId;
      }

      if (selectedEvent) {
        selectedEvent.remove();
      }
      api.addEvent(newEvent);
      api.unselect();
    } catch (error) {
      console.error("Event operation error:", error);
      setGoogleState((prev) => ({
        ...prev,
        error: "Failed to save event in Google Calendar",
      }));
    } finally {
      setGoogleState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleEventDelete = async (event: EventApi) => {
    try {
      setGoogleState((prev) => ({ ...prev, isLoading: true }));

      const googleEventId = event.extendedProps?.googleEventId;

      if (googleEventId) {
        await googleCalendarService.deleteEvent(googleEventId);
      }

      event.remove();
    } catch (error) {
      console.error("Delete event error:", error);
      setGoogleState((prev) => ({
        ...prev,
        error: "Failed to delete event from Google Calendar",
      }));
    } finally {
      setGoogleState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const syncWithGoogle = async () => {
    const api = calendarApiRef?.current;
    if (!api) return;

    try {
      setGoogleState((prev) => ({ ...prev, isLoading: true }));
      const googleEvents = await googleCalendarService.listEvents();

      api.removeAllEvents();

      googleEvents.forEach((event) => {
        api.addEvent({
          ...event,
          extendedProps: {
            googleEventId: event.googleEventId,
          },
        });
      });
    } catch (error) {
      setGoogleState((prev) => ({
        ...prev,
        error: "Failed to sync with Google Calendar",
      }));
    } finally {
      setGoogleState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    currentEvents,
    selectedEvent,
    selectedDates,
    googleState,
    setSelectedEvent,
    setSelectedDates,
    handleEvents,
    handleEventClick,
    handleDateSelect,
    handleCreateEvent,
    handleEventDelete,
    syncWithGoogle,
  };
}
