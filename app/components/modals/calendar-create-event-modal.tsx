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
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [showTimeSelectors, setShowTimeSelectors] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSelectedStartTime("");
      setSelectedEndTime("");
      setShowTimeSelectors(false);
    } else {
      setTitle(isEditMode ? initialTitle : "");
      const date = new Date(startDate);
      if (view.type !== "dayGridMonth") {
        const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
        setSelectedStartTime(timeStr);
        setSelectedEndTime(timeStr);
        setShowTimeSelectors(true);
      } else {
        setShowTimeSelectors(false);
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

  const formatEndTimeOptions = () => {
    const startTimeIndex = timeSlots.indexOf(selectedStartTime);
    return timeSlots.slice(startTimeIndex + 1).map((endTime, index) => {
      const duration = (index + 1) * 30;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      const durationString = `${hours > 0 ? `${hours}hr ` : ""}${
        minutes > 0 ? `${minutes}min` : ""
      }`;
      return `${endTime} (${durationString})`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, selectedStartTime, isAllDay);
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
              {!showTimeSelectors ? (
                <Button onClick={() => setShowTimeSelectors(true)}>
                  Add Time
                </Button>
              ) : (
                <div className="flex">
                  <Select
                    value={selectedStartTime}
                    onValueChange={setSelectedStartTime}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((startTime) => (
                        <SelectItem key={startTime} value={startTime}>
                          {startTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedEndTime}
                    onValueChange={setSelectedEndTime}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {formatEndTimeOptions().map((endTime) => (
                        <SelectItem key={endTime} value={endTime}>
                          {endTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="text-sm">
            <p>Date: {new Date(startDate).toLocaleDateString()}</p>
            {(isMonthView || !isAllDay) && showTimeSelectors && (
              <p>
                Time: {selectedStartTime} - {selectedEndTime}
              </p>
            )}
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
