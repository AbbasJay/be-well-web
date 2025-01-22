import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function CalendarCreateEventModal() {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Create Event</DialogTitle>
    </Dialog>
  );
}
