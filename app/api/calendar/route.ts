import { google } from "googleapis";
import { NextResponse } from "next/server";
import { CalendarEvent } from "@/app/types/calendar";
import { OAuth2Client } from "google-auth-library";

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

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.split(" ")[1];
    const calendar = await getGoogleCalendar(accessToken);

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
      {
        error: "Failed to fetch events from Google Calendar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No access token provided" }),
        { status: 401 }
      );
    }

    const accessToken = authHeader.split(" ")[1];
    const calendar = await getGoogleCalendar(accessToken);
    const event: CalendarEvent = await request.json();

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        description: event.description || "",
        location: event.location || "",
        start: {
          dateTime: event.allDay ? undefined : event.start,
          date: event.allDay ? event.start.split("T")[0] : undefined,
          timeZone: event.allDay
            ? undefined
            : Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.allDay ? undefined : event.end,
          date: event.allDay ? event.end.split("T")[0] : undefined,
          timeZone: event.allDay
            ? undefined
            : Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.split(" ")[1];
    const calendar = await getGoogleCalendar(accessToken);
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.split(" ")[1];
    const calendar = await getGoogleCalendar(accessToken);
    const event: CalendarEvent = await request.json();

    if (!event.googleEventId) {
      throw new Error("Google Event ID not found");
    }

    await calendar.events.update({
      calendarId: "primary",
      eventId: event.googleEventId,
      requestBody: {
        summary: event.title,
        description: event.description || "",
        location: event.location || "",
        start: {
          dateTime: event.allDay ? undefined : event.start,
          date: event.allDay ? event.start.split("T")[0] : undefined,
          timeZone: event.allDay
            ? undefined
            : Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.allDay ? undefined : event.end,
          date: event.allDay ? event.end.split("T")[0] : undefined,
          timeZone: event.allDay
            ? undefined
            : Intl.DateTimeFormat().resolvedOptions().timeZone,
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
