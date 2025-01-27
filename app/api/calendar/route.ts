import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { CalendarEvent } from "@/app/types/calendar";
import { OAuth2Client } from "google-auth-library";

const getGoogleCalendar = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error("No access token found");
  }

  const oauth2Client = new OAuth2Client(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
};

export async function GET() {
  try {
    const calendar = await getGoogleCalendar();

    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 1);
    const timeMax = new Date();
    timeMax.setFullYear(timeMax.getFullYear() + 1);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = (response.data.items || []).map(
      (event): CalendarEvent => ({
        id: event.id || "",
        googleEventId: event.id || "",
        title: event.summary || "",
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        allDay: !event.start?.dateTime,
      })
    );

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events from Google Calendar" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const calendar = await getGoogleCalendar();
    const event: CalendarEvent = await request.json();

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        start: {
          dateTime: event.allDay ? undefined : event.start,
          date: event.allDay ? event.start.split("T")[0] : undefined,
        },
        end: {
          dateTime: event.allDay ? undefined : event.end,
          date: event.allDay ? event.end.split("T")[0] : undefined,
        },
      },
    });

    return NextResponse.json({ id: response.data.id });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event in Google Calendar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const calendar = await getGoogleCalendar();
    const { eventId } = await request.json();

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event from Google Calendar" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const calendar = await getGoogleCalendar();
    const event: CalendarEvent = await request.json();

    if (!event.googleEventId) {
      throw new Error("Google Event ID not found");
    }

    await calendar.events.update({
      calendarId: "primary",
      eventId: event.googleEventId,
      requestBody: {
        summary: event.title,
        start: {
          dateTime: event.allDay ? undefined : event.start,
          date: event.allDay ? event.start.split("T")[0] : undefined,
        },
        end: {
          dateTime: event.allDay ? undefined : event.end,
          date: event.allDay ? event.end.split("T")[0] : undefined,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event in Google Calendar" },
      { status: 500 }
    );
  }
}
