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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Current Event: {event?.title}</DialogTitle>
        <span>Start: {event?.start?.toLocaleString()}</span>
        <span>End: {event?.end?.toLocaleString()}</span>
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
