import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EventApi, formatDate } from "@fullcalendar/core";

interface CalendarSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEvents: EventApi[];
}

export default function CalendarSelectModal({
  open,
  onOpenChange,
  currentEvents,
}: CalendarSelectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>All Events</DialogTitle>
      <DialogContent>
        <ul className="space-y-2">
          {currentEvents.map((event) => (
            <li key={event.id} className="flex flex-col">
              <div className="font-bold">
                {event.start &&
                  formatDate(event.start, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                {event.start && (
                  <span className="ml-2 text-muted-foreground">
                    {formatDate(event.start, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <span className="italic">{event.title}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
