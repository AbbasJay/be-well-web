import { useState, useEffect, MutableRefObject } from "react";
import { EventApi, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import {
  CalendarEvent,
  SelectedDates,
  GoogleCalendarState,
} from "@/app/types/calendar";
import { createEventId } from "@/app/utils/calendar";
import * as googleCalendarService from "@/app/services/google-calendar";

export function useCalendarWithGoogle(
  accessToken?: string,
  calendarApiRef?: MutableRefObject<any>
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
    if (!selectedDates || !calendarApiRef?.current) return;

    const startDate = new Date(selectedDates.start);
    const endDate = new Date(selectedDates.end);

    if (selectedDates.view.type === "dayGridMonth") {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      startDate.setHours(hours, minutes, 0);
      endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
    } else if (!isAllDay) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      startDate.setHours(hours, minutes, 0);
      endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
    }

    const newEvent: CalendarEvent = {
      id: createEventId(),
      title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: isAllDay && selectedDates.view.type !== "dayGridMonth",
    };

    try {
      setGoogleState((prev) => ({ ...prev, isLoading: true }));
      const googleEventId = await googleCalendarService.createEvent(newEvent);
      newEvent.googleEventId = googleEventId;

      calendarApiRef.current.addEvent(newEvent);
      calendarApiRef.current.unselect();
    } catch (error) {
      setGoogleState((prev) => ({
        ...prev,
        error: "Failed to create event in Google Calendar",
      }));
    } finally {
      setGoogleState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleEventDelete = async (event: EventApi) => {
    try {
      const googleEventId = event.extendedProps.googleEventId;
      if (googleEventId) {
        setGoogleState((prev) => ({ ...prev, isLoading: true }));
        await googleCalendarService.deleteEvent(googleEventId);
      }
      event.remove();
    } catch (error) {
      setGoogleState((prev) => ({
        ...prev,
        error: "Failed to delete event from Google Calendar",
      }));
    } finally {
      setGoogleState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const syncWithGoogle = async () => {
    if (!calendarApiRef?.current) return;
    try {
      setGoogleState((prev) => ({ ...prev, isLoading: true }));
      const googleEvents = await googleCalendarService.listEvents();

      calendarApiRef.current.removeAllEvents();

      googleEvents.forEach((event) => {
        calendarApiRef.current.addEvent({
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
