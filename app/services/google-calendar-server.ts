import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Class } from "@/lib/db/schema";
import { createCalendarEventFromClass } from "../utils/calendar";

const getGoogleCalendar = async (accessToken: string) => {
  const oauth2Client = new OAuth2Client(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
};

export const createEventFromClassServer = async (
  classData: Partial<Class>,
  accessToken: string
): Promise<string | null> => {
  try {
    // Create calendar event from class data
    const calendarEvent = createCalendarEventFromClass(classData);

    // Get Google Calendar instance
    const calendar = await getGoogleCalendar(accessToken);

    // Create the event in Google Calendar
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: calendarEvent.title,
        description: calendarEvent.description || "",
        location: calendarEvent.location || "",
        start: {
          dateTime: calendarEvent.start,
        },
        end: {
          dateTime: calendarEvent.end,
        },
      },
    });

    console.log(`Calendar event created for class: ${classData.name}`);
    return response.data.id || null;
  } catch (error) {
    console.error("Error creating calendar event from class:", error);
    return null;
  }
};

export const updateEventFromClassServer = async (
  classData: Partial<Class>,
  accessToken: string,
  googleEventId: string
): Promise<boolean> => {
  try {
    // Create calendar event from class data
    const calendarEvent = createCalendarEventFromClass(classData);

    // Get Google Calendar instance
    const calendar = await getGoogleCalendar(accessToken);

    // Update the existing event in Google Calendar
    await calendar.events.update({
      calendarId: "primary",
      eventId: googleEventId,
      requestBody: {
        summary: calendarEvent.title,
        description: calendarEvent.description || "",
        location: calendarEvent.location || "",
        start: {
          dateTime: calendarEvent.start,
        },
        end: {
          dateTime: calendarEvent.end,
        },
      },
    });

    console.log(`Calendar event updated for class: ${classData.name}`);
    return true;
  } catch (error) {
    console.error("Error updating calendar event from class:", error);
    return false;
  }
};

export const deleteEventFromClassServer = async (
  accessToken: string,
  googleEventId: string
): Promise<boolean> => {
  try {
    // Get Google Calendar instance
    const calendar = await getGoogleCalendar(accessToken);

    // Delete the event from Google Calendar
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });

    console.log(`Calendar event deleted with ID: ${googleEventId}`);
    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return false;
  }
};
