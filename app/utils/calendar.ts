import { CalendarEvent } from "@/app/types/calendar";
import { Class } from "@/lib/db/schema";

/**
 * Generates a unique event ID using timestamp and random number
 */
export const createEventId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export function createCalendarEventFromClass(
  classData: Partial<Class>
): CalendarEvent {
  // Ensure required fields are present
  if (
    !classData.startDate ||
    !classData.time ||
    !classData.name ||
    !classData.instructor
  ) {
    throw new Error("Missing required class data for calendar event creation");
  }

  // Parse the start date and time
  const startDate = new Date(classData.startDate);
  const [hours, minutes] = classData.time.split(":").map(Number);
  startDate.setHours(hours, minutes, 0, 0);

  // Calculate end time based on duration
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (classData.duration || 60));

  // Create event title with class details
  const eventTitle = `${classData.name} - ${classData.instructor}`;

  // Create event description with additional details
  const eventDescription = [
    classData.description,
    `Instructor: ${classData.instructor}`,
    `Price: $${classData.price}`,
    `Capacity: ${classData.capacity} people`,
    `Slots Available: ${classData.slotsLeft || classData.capacity}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: createEventId(),
    title: eventTitle,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    allDay: false,
    googleEventId: undefined,
    description: eventDescription,
    location: classData.location || "",
  };
}

export function formatClassDateTime(date: string, time?: string): string {
  const d = new Date(date + (time ? "T" + time : ""));
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = d.toLocaleString("default", { month: "long" });
  const year = d.getFullYear();

  // Ordinal suffix
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  let timeStr = "";
  if (time) {
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 => 12
    timeStr = `${hours}`;
    if (minutes > 0) {
      timeStr += `:${minutes.toString().padStart(2, "0")}`;
    }
    timeStr += ampm;
  }

  return `${day}${getOrdinal(day)} ${month} ${year}${
    timeStr ? ", " + timeStr : ""
  }`;
}
