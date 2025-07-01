import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventApi } from "@fullcalendar/core";

interface CalendarEventActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventApi;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CalendarEventActionsModal({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
}: CalendarEventActionsModalProps) {
  const formatEventTime = () => {
    if (event?.allDay) {
      const startDate = event.start ? new Date(event.start) : null;
      const endDate = event.end ? new Date(event.end) : null;

      if (startDate && endDate) {
        // For all-day events, Google Calendar sets the end date to the start of the next day
        // So we need to check if it's actually a single day or multiple days
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const startMonth = startDate.getMonth();
        const endMonth = endDate.getMonth();
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();

        // If it's the same day or consecutive days (single-day all-day event)
        if (
          (startYear === endYear &&
            startMonth === endMonth &&
            startDay === endDay) ||
          (startYear === endYear &&
            startMonth === endMonth &&
            endDay === startDay + 1)
        ) {
          return `All Day: ${startDate.toLocaleDateString()}`;
        } else {
          // Multi-day event
          return `All Day: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        }
      }
      return "All Day Event";
    } else {
      const startTime = event?.start?.toLocaleString() || "";
      const endTime = event?.end?.toLocaleString() || "";
      return `Start: ${startTime}\nEnd: ${endTime}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Current Event: {event?.title}</DialogTitle>
        <div className="whitespace-pre-line">{formatEventTime()}</div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onEdit}>Edit</Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
