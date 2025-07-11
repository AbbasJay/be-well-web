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
import { Calendar as CalendarIcon, Clock, Play } from "lucide-react";

interface EditEventModalProps {
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
  initialTitle: string;
}

export default function EditEventModal({
  open,
  onOpenChange,
  onSubmit,
  startDate,
  endDate,
  isAllDay,
  view,
  initialTitle = "",
}: EditEventModalProps) {
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
  const [title, setTitle] = useState(initialTitle);
  const [selectedStartTime, setSelectedStartTime] = useState(
    formatSelectedStartTime()
  );
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [showTimeSelectors, setShowTimeSelectors] = useState(false);
  const [isAllDayEvent, setIsAllDayEvent] = useState(isAllDay);

  useEffect(() => {
    if (!open) {
      setTitle(initialTitle);
      const initialStartTime = formatSelectedStartTime();
      setSelectedStartTime(initialStartTime);
      const startIndex = timeSlots.indexOf(initialStartTime);
      const nextSlot = timeSlots[startIndex + 1] || timeSlots[0] || "00:30";
      setSelectedEndTime(nextSlot);
      setShowTimeSelectors(false);
      setIsAllDayEvent(isAllDay);
    } else {
      setTitle(initialTitle);
      setIsAllDayEvent(isAllDay);
      if (view.type !== "dayGridMonth" && !isAllDay) {
        const date = new Date(startDate);
        const localHours = date.getHours();
        const localMinutes = date.getMinutes();
        const timeStr = `${localHours
          .toString()
          .padStart(2, "0")}:${localMinutes.toString().padStart(2, "0")}`;
        setSelectedStartTime(timeStr);

        if (endDate) {
          const endDateObj = new Date(endDate);
          const endHours = endDateObj.getHours();
          const endMinutes = endDateObj.getMinutes();
          const endTimeStr = `${endHours
            .toString()
            .padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
          setSelectedEndTime(endTimeStr);
        } else {
          const startIndex = timeSlots.indexOf(timeStr);
          const nextSlot = timeSlots[startIndex + 1] || timeSlots[0] || "00:30";
          setSelectedEndTime(nextSlot);
        }
        setShowTimeSelectors(true);
      } else {
        setShowTimeSelectors(false);
      }
    }
  }, [open, initialTitle, startDate, endDate, view.type, timeSlots, isAllDay]);

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
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <DialogTitle className="text-2xl font-bold text-blue-900 text-center">
            Edit Event
          </DialogTitle>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 bg-white flex flex-col items-center w-full"
        >
          <div className="w-full mb-4">
            <label className="text-sm font-semibold">Event Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="mt-2 text-base px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="w-full flex flex-col gap-4 items-start mb-4">
            {isAllDayEvent ? (
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-600">
                    All Day
                  </div>
                  <div className="text-base text-gray-900">
                    {(() => {
                      const startDateObj = startDate
                        ? new Date(startDate)
                        : null;
                      const endDateObj = endDate ? new Date(endDate) : null;
                      if (startDateObj && endDateObj) {
                        const startStr = startDateObj.toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        );
                        const endStr = endDateObj.toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        );
                        if (startStr === endStr) {
                          return startStr;
                        } else {
                          return `${startStr} - ${endStr}`;
                        }
                      }
                      return "All Day Event";
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm font-semibold text-gray-600">
                      Start
                    </div>
                    <div className="text-base text-gray-900">
                      {startDate
                        ? new Date(startDate).toLocaleString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="text-sm font-semibold text-gray-600">
                      End
                    </div>
                    <div className="text-base text-gray-900">
                      {endDate
                        ? new Date(endDate).toLocaleString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : ""}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mb-4">
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
            <div className="w-full mb-4">
              {!showTimeSelectors ? (
                <Button
                  type="button"
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
          <div className="border-t border-gray-200 w-full my-4" />
          <DialogFooter className="flex gap-2 w-full">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-1/2">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
