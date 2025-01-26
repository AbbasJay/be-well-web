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
}

export default function CalendarEventActionsModal({
  open,
  onOpenChange,
  event,
}: CalendarEventActionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Current Event: {event?.title}</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
