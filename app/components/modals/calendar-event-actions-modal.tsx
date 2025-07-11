import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventApi } from "@fullcalendar/core";
import {
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Play,
} from "lucide-react";

interface CalendarEventActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventApi;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CalendarEventActionsModal({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
}: CalendarEventActionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <DialogTitle className="text-2xl font-bold text-blue-900 text-center">
            {event?.title}
          </DialogTitle>
        </div>
        <div className="px-6 py-6 bg-white flex flex-col items-center">
          {event?.allDay ? (
            <div className="w-full flex flex-col gap-4 items-start">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-600">
                    All Day
                  </div>
                  <div className="text-base text-gray-900">
                    {(() => {
                      const startDate = event.start
                        ? new Date(event.start)
                        : null;
                      const endDate = event.end ? new Date(event.end) : null;
                      if (startDate && endDate) {
                        const startStr = startDate.toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        );
                        const endStr = endDate.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
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
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4 items-start">
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-600">
                    Start
                  </div>
                  <div className="text-base text-gray-900">
                    {event?.startStr
                      ? new Date(event.startStr).toLocaleString(undefined, {
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
                  <div className="text-sm font-semibold text-gray-600">End</div>
                  <div className="text-base text-gray-900">
                    {event?.endStr
                      ? new Date(event.endStr).toLocaleString(undefined, {
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
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 w-full" />
        <DialogFooter className="flex gap-2 px-6 py-4 bg-white w-full">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-1/3"
          >
            Close
          </Button>
          <Button
            onClick={() => onEdit()}
            className="w-1/3 flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="w-1/3 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
