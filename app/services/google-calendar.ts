import { CalendarEvent } from "../types/calendar";

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`/api/calendar${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch from Calendar API");
  }

  return response.json();
};

export const listEvents = async (): Promise<CalendarEvent[]> => {
  return fetchWithAuth("");
};

export const createEvent = async (event: CalendarEvent): Promise<string> => {
  const response = await fetchWithAuth("", {
    method: "POST",
    body: JSON.stringify(event),
  });
  return response.id;
};

export const updateEvent = async (event: CalendarEvent): Promise<void> => {
  if (!event.googleEventId) {
    throw new Error("Google Event ID not found");
  }

  await fetchWithAuth("", {
    method: "PUT",
    body: JSON.stringify(event),
  });
};

export const deleteEvent = async (googleEventId: string): Promise<void> => {
  await fetchWithAuth("", {
    method: "DELETE",
    body: JSON.stringify({ eventId: googleEventId }),
  });
};
