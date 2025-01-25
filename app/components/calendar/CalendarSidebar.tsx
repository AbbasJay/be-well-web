import React from "react";
import { EventApi } from "@fullcalendar/core";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CalendarSelectModal from "../modals/calendar-view-events-modal";

export default function CalendarSidebar({
  weekendsVisible,
  handleWeekendsToggle,
  currentEvents,
}: {
  weekendsVisible: boolean;
  handleWeekendsToggle: () => void;
  currentEvents: EventApi[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <Button onClick={() => setIsModalOpen(true)}>
          View All Events ({currentEvents.length})
        </Button>
        <CalendarSelectModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          currentEvents={currentEvents}
        />
      </div>
    </div>
  );
}
