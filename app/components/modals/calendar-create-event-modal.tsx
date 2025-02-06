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
  const formatSelectedStartTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (minutes > 0 && minutes <= 30) {
      minutes = 30;
    } else if (minutes > 30) {
      minutes = 0;
      hours = (hours + 1) % 24;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const [title, setTitle] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState(
    formatSelectedStartTime()
  );
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [showTimeSelectors, setShowTimeSelectors] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      const initialStartTime = formatSelectedStartTime();
      setSelectedStartTime(initialStartTime);
      const startIndex = timeSlots.indexOf(initialStartTime);
      const nextSlot = timeSlots[startIndex + 1] || "";
      setSelectedEndTime(nextSlot);
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
        setSelectedEndTime(timeSlots[timeSlots.indexOf(timeStr) + 1] || "");
        setShowTimeSelectors(true);
      } else {
        setShowTimeSelectors(false);
      }
    }
  }, [open, isEditMode, initialTitle, startDate, view.type, timeSlots]);

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

  useEffect(() => {
    if (showTimeSelectors && selectedStartTime) {
      const startIndex = timeSlots.indexOf(selectedStartTime);
      const nextSlot = timeSlots[startIndex + 1] || "";
      setSelectedEndTime(nextSlot);
    }
  }, [selectedStartTime, timeSlots, showTimeSelectors]);

  const formatEndTimeOptions = () => {
    const startTimeIndex = timeSlots.indexOf(selectedStartTime);
    return timeSlots.slice(startTimeIndex + 1).map((endTime) => ({
      value: endTime,
      label: `${endTime} (${getDurationString(endTime)})`,
    }));
  };

  const getDurationString = (endTime: string) => {
    const startIndex = timeSlots.indexOf(selectedStartTime);
    const endIndex = timeSlots.indexOf(endTime);
    const duration = (endIndex - startIndex) * 30;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours > 0 ? `${hours}hr ` : ""}${
      minutes > 0 ? `${minutes}min` : ""
    }`;
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
                      <SelectValue placeholder={formatSelectedStartTime()} />
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
                    onValueChange={(newEndTime) =>
                      setSelectedEndTime(newEndTime)
                    }
                  >
                    <SelectTrigger className="">
                      <SelectValue
                        placeholder={
                          timeSlots[timeSlots.indexOf(selectedStartTime) + 1] ||
                          ""
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {formatEndTimeOptions().map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
