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
    selectedStartTime: string,
    selectedEndTime: string,
    isAllDay: boolean
  ) => {
    const api = calendarApiRef?.current;
    if (!selectedDates || !api) return;

    try {
      setGoogleState((prev) => ({ ...prev, isLoading: true }));

      // Parse the UTC dates from FullCalendar
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
        const [startHours, startMinutes] = selectedStartTime
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = selectedEndTime.split(":").map(Number);

        // Create dates in local timezone to avoid timezone conversion issues
        const localStartDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          startHours,
          startMinutes,
          0,
          0
        );

        // If end time is before or equal to start time, increment the day for end date
        let endDay = startDate.getDate();
        if (
          endHours < startHours ||
          (endHours === startHours && endMinutes <= startMinutes)
        ) {
          endDay += 1;
        }

        const localEndDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          endDay,
          endHours,
          endMinutes,
          0,
          0
        );

        startDate = localStartDate;
        endDate = localEndDate;
      } else {
        // For all-day events, use only the start date and create a single-day event
        const localStartDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0,
          0,
          0,
          0
        );

        // End date should be the same day, just before midnight
        const localEndDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          23,
          59,
          59,
          999
        );

        startDate = localStartDate;
        endDate = localEndDate;
      }

      const newEvent: CalendarEvent = {
        id: selectedEvent?.id || createEventId(),
        title,
        start: isAllDay
          ? `${startDate.getFullYear()}-${String(
              startDate.getMonth() + 1
            ).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`
          : startDate.toISOString(),
        end: isAllDay
          ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(endDate.getDate()).padStart(2, "0")}`
          : endDate.toISOString(),
        allDay: isAllDay,
        googleEventId: selectedEvent?.extendedProps?.googleEventId,
      };
      if (newEvent.googleEventId) {
        await googleCalendarService.updateEvent(newEvent);
        // Update the existing event instead of removing and re-adding
        if (selectedEvent) {
          selectedEvent.setProp("title", newEvent.title);
          selectedEvent.setStart(newEvent.start);
          selectedEvent.setEnd(newEvent.end);
          selectedEvent.setAllDay(newEvent.allDay);
        }
      } else {
        const googleEventId = await googleCalendarService.createEvent(newEvent);
        newEvent.googleEventId = googleEventId;
        // Only add new event if it's not an update
        api.addEvent(newEvent);
      }

      // Remove the old event only if we're not updating an existing one
      if (selectedEvent && !selectedEvent.extendedProps?.googleEventId) {
        selectedEvent.remove();
      }
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
