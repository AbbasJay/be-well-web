import React from "react";
import { EventApi, formatDate } from "@fullcalendar/core";

export default function CalendarSidebar({
  weekendsVisible,
  handleWeekendsToggle,
  currentEvents,
}: {
  weekendsVisible: boolean;
  handleWeekendsToggle: () => void;
  currentEvents: EventApi[];
}) {
  return (
    <div>
      <div>
        <h2>Instructions</h2>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={weekendsVisible}
            onChange={handleWeekendsToggle}
          ></input>
          toggle weekends
        </label>
      </div>
      <div>
        <h2>All Events ({currentEvents.length})</h2>
        <ul>
          {currentEvents.map((event) => (
            <SidebarEvent key={event.id} event={event} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SidebarEvent({ event }: { event: EventApi }) {
  return (
    <li key={event.id}>
      <b>
        {event.start &&
          formatDate(event.start, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
      </b>
      <i>{event.title}</i>
    </li>
  );
}
