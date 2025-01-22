import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Calendar from "../calendar/Calendar";
import { EventApi } from "@fullcalendar/core";

export default function CalendarSelectModal({
  open,
  onOpenChange,
  currentEvents,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEvents: EventApi[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Select a date</DialogTitle>
      <DialogContent></DialogContent>
    </Dialog>
  );
}
