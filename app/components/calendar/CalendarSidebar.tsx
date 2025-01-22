import React, { useState } from 'react';
import { formatDate } from '@fullcalendar/core';

export default function CalendarSidebar({ weekendsVisible, handleWeekendsToggle, currentEvents }: { weekendsVisible: boolean, handleWeekendsToggle: () => void, currentEvents: any[] }) {
    return (
      <div>
        <div>
          <h2>Instructions</h2>
        </div>
        <div>
          <label>
            <input
              type='checkbox'
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
    )
  }
  
  function SidebarEvent({ event }: { event: any }) {
    return (
      <li key={event.id}>
        <b>{formatDate(event.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
        <i>{event.title}</i>
      </li>
    )
  }