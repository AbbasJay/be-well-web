"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CalendarEvent } from "@/app/types/calendar";

interface CalendarContextType {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  lastFetched: Date | null;
  fetchEvents: (accessToken: string, force?: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (accessToken: string, force: boolean = false) => {
      // If we've fetched in the last 5 minutes and not forcing, don't fetch again
      if (
        !force &&
        lastFetched &&
        new Date().getTime() - lastFetched.getTime() < 5 * 60 * 1000
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/calendar", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch calendar events");
        }

        const data = await response.json();
        setEvents(data);
        setLastFetched(new Date());
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch calendar events"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [lastFetched]
  );

  return (
    <CalendarContext.Provider
      value={{
        events,
        setEvents,
        lastFetched,
        fetchEvents,
        isLoading,
        error,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
