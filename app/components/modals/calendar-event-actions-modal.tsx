import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventApi } from "@fullcalendar/core";
import { Edit, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";

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
      <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-2 w-full">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <DialogTitle className="text-xl font-bold tracking-tight flex-1">
            {event?.title}
          </DialogTitle>
        </div>
        <div className="whitespace-pre-line text-base text-muted-foreground flex items-center gap-2 mb-4 w-full">
          <Clock className="w-4 h-4" />
          <span>{formatEventTime()}</span>
        </div>
        <DialogFooter className="flex gap-2 mt-6 w-full">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-1/3"
          >
            Close
          </Button>
          <Button onClick={onEdit} className="w-1/3 flex items-center gap-1">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="w-1/3 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
