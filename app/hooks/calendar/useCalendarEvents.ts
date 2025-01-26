import { useState } from "react";
import {
  DateSelectArg,
  EventClickArg,
  EventApi,
  ViewApi,
} from "@fullcalendar/core";

interface SelectedDates {
  start: string;
  end: string;
  allDay: boolean;
  view: ViewApi;
}

export function useCalendarEvents() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [selectedDates, setSelectedDates] = useState<SelectedDates | null>(
    null
  );

  let eventGUID = 0;
  const createEventId = () => String(eventGUID++);

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

  const handleCreateEvent = (
    title: string,
    selectedTime: string,
    isAllDay: boolean
  ) => {
    if (selectedEvent) {
      selectedEvent.setProp("title", title);
      setSelectedEvent(null);
    } else if (selectedDates && title) {
      const calendarApi = selectedDates.view.calendar;
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

      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: isAllDay && selectedDates.view.type !== "dayGridMonth",
      });

      calendarApi.unselect();
    }
  };

  const handleEventDelete = (event: EventApi) => {
    event.remove();
  };

  return {
    currentEvents,
    selectedEvent,
    selectedDates,
    setSelectedEvent,
    setSelectedDates,
    handleEvents,
    handleEventClick,
    handleDateSelect,
    handleCreateEvent,
    handleEventDelete,
  };
}
