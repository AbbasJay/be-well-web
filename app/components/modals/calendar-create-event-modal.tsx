import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { ViewApi } from "@fullcalendar/core";

interface CalendarCreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, selectedTime: string, isAllDay: boolean) => void;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  view: ViewApi;
  isEditMode?: boolean;
  initialTitle?: string;
}

export default function CalendarCreateEventModal({
  open,
  onOpenChange,
  onSubmit,
  startDate,
  isAllDay,
  view,
  isEditMode = false,
  initialTitle = "",
}: CalendarCreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(isEditMode ? initialTitle : "");
      const date = new Date(startDate);
      if (view.type !== "dayGridMonth") {
        setSelectedTime(
          `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        );
      }
    }
  }, [open, isEditMode, initialTitle, startDate, view.type]);

  useEffect(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    setTimeSlots(slots);
  }, []);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, selectedTime, isAllDay);
      onOpenChange(false);
    }
  };

  const isMonthView = view.type === "dayGridMonth";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>
          {isEditMode ? "Edit Event" : "Create New Event"}
        </DialogTitle>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Event Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="mt-1"
            />
          </div>
          {(isMonthView || !isAllDay) && (
            <div>
              <label className="text-sm font-medium">Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="text-sm">
            <p>Date: {new Date(startDate).toLocaleDateString()}</p>
            {(isMonthView || !isAllDay) && <p>Time: {selectedTime}</p>}
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? "Save Changes" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
