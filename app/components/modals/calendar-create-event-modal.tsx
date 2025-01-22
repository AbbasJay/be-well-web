import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CalendarCreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CalendarCreateEventModal({
  open,
  onOpenChange,
}: CalendarCreateEventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Create Event</DialogTitle>
    </Dialog>
  );
}
