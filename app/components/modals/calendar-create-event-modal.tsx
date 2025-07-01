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
import {
  PlusCircle,
  Edit,
  X,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CalendarCreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    title: string,
    selectedStartTime: string,
    selectedEndTime: string,
    isAllDay: boolean
  ) => void;
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
  const [isAllDayEvent, setIsAllDayEvent] = useState(isAllDay);

  useEffect(() => {
    if (!open) {
      setTitle("");
      const initialStartTime = formatSelectedStartTime();
      setSelectedStartTime(initialStartTime);
      const startIndex = timeSlots.indexOf(initialStartTime);
      const nextSlot = timeSlots[startIndex + 1] || timeSlots[0] || "00:30";
      setSelectedEndTime(nextSlot);
      setShowTimeSelectors(false);
      setIsAllDayEvent(isAllDay);
    } else {
      setTitle(isEditMode ? initialTitle : "");
      setIsAllDayEvent(isAllDay);
      const date = new Date(startDate);
      if (view.type !== "dayGridMonth" && !isAllDay) {
        const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
        setSelectedStartTime(timeStr);
        const startIndex = timeSlots.indexOf(timeStr);
        const nextSlot = timeSlots[startIndex + 1] || timeSlots[0] || "00:30";
        setSelectedEndTime(nextSlot);
        setShowTimeSelectors(true);
      } else {
        setShowTimeSelectors(false);
      }
    }
  }, [
    open,
    isEditMode,
    initialTitle,
    startDate,
    view.type,
    timeSlots,
    isAllDay,
  ]);

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
      const nextSlot = timeSlots[startIndex + 1] || timeSlots[0] || "00:30";
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
    onSubmit(title, selectedStartTime, selectedEndTime, isAllDayEvent);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-6 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-2 w-full">
          {isEditMode ? (
            <Edit className="w-6 h-6 text-blue-600" />
          ) : (
            <PlusCircle className="w-6 h-6 text-green-600" />
          )}
          <DialogTitle className="text-xl font-bold tracking-tight flex-1">
            {isEditMode ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </div>
        <div className="space-y-5 w-full">
          <div>
            <label className="text-sm font-semibold">Event Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="mt-2 text-base px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={isAllDayEvent}
              onChange={(e) => {
                setIsAllDayEvent(e.target.checked);
                setShowTimeSelectors(!e.target.checked);
              }}
              className="rounded border-gray-300 accent-blue-500 w-5 h-5"
            />
            <label htmlFor="allDay" className="text-sm font-medium">
              All Day
            </label>
          </div>
          {!isAllDayEvent && (
            <div>
              {!showTimeSelectors ? (
                <Button
                  onClick={() => setShowTimeSelectors(true)}
                  className="w-full flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Add Time
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={selectedStartTime}
                    onValueChange={setSelectedStartTime}
                  >
                    <SelectTrigger className="w-28">
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
                    onValueChange={setSelectedEndTime}
                  >
                    <SelectTrigger className="w-28">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="w-4 h-4" />
            <span>Date: {new Date(startDate).toLocaleDateString()}</span>
            {!isAllDayEvent && showTimeSelectors && (
              <Badge className="ml-2 bg-blue-100 text-blue-700">
                <Clock className="w-3 h-3 mr-1" />
                {selectedStartTime} - {selectedEndTime}
              </Badge>
            )}
          </div>
        </div>
        <DialogFooter className="mt-8 flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-1/2"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="w-1/2">
            {isEditMode ? "Save Changes" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
