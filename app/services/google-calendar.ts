import { CalendarEvent } from "../types/calendar";
import { Class } from "@/lib/db/schema";

const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
) => {
  try {
    // Get the access token from the auth endpoint
    const authResponse = await fetch("/api/calendar/auth");
    const authData = await authResponse.json();

    // If we get a URL instead of a token, we need to re-authenticate
    if (authData.url) {
      window.location.href = authData.url;
      throw new Error("Authentication required");
    }

    if (!authData.access_token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`/api/calendar${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      if (response.status === 401 && retryCount < 2) {
        return fetchWithAuth(endpoint, options, retryCount + 1);
      }

      throw new Error(error.message || "Failed to fetch from Calendar API");
    }

    return response.json();
  } catch (error) {
    console.error("Calendar API error:", {
      endpoint,
      error,
      retryCount,
    });
    throw error;
  }
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

export const createEventFromClass = async (
  classData: Partial<Class>
): Promise<string | null> => {
  try {
    // Import the utility function
    const { createCalendarEventFromClass } = await import("../utils/calendar");

    // Create calendar event from class data
    const calendarEvent = createCalendarEventFromClass(classData);

    // Create the event in Google Calendar
    const googleEventId = await createEvent(calendarEvent);

    console.log(`Calendar event created for class: ${classData.name}`);
    return googleEventId;
  } catch (error) {
    console.error("Error creating calendar event from class:", error);
    return null;
  }
};
