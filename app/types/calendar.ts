import { EventApi, ViewApi } from "@fullcalendar/core";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  googleEventId?: string;
  description?: string;
  location?: string;
}

export interface SelectedDates {
  start: string;
  end: string;
  allDay: boolean;
  view: ViewApi;
}

export interface GoogleCalendarState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CalendarEventHandlers {
  handleEventClick: (event: EventApi) => void;
  handleDateSelect: (start: Date, end: Date, allDay: boolean) => void;
  handleEventCreate: (event: CalendarEvent) => Promise<void>;
  handleEventUpdate: (event: CalendarEvent) => Promise<void>;
  handleEventDelete: (eventId: string) => Promise<void>;
  handleGoogleSync: () => Promise<void>;
}
