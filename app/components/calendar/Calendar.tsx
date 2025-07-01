import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRef, useEffect } from "react";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  CalendarApi,
  EventApi,
} from "@fullcalendar/core";
import CalendarCreateEventModal from "../modals/calendar-create-event-modal";
import CalendarEventActionsModal from "../modals/calendar-event-actions-modal";
import { useCalendarWithGoogle } from "../../hooks/calendar/useCalendarWithGoogle";
import { useCalendarModals } from "../../hooks/calendar/useCalendarModals";
import { useCalendar } from "@/app/contexts/CalendarContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CalendarProps {
  accessToken?: string;
}

export default function Calendar({ accessToken }: CalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const calendarApiRef = useRef<CalendarApi | null>(null);
  const {
    events,
    fetchEvents,
    isLoading: isFetching,
    error: fetchError,
  } = useCalendar();

  const {
    selectedEvent,
    selectedDates,
    googleState,
    setSelectedDates,
    handleEvents,
    handleEventClick,
    handleDateSelect,
    handleCreateEvent,
    handleEventDelete,
    setSelectedEvent,
  } = useCalendarWithGoogle(accessToken, calendarApiRef);

  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEventActionsModalOpen,
    setIsEventActionsModalOpen,
    isDeleteConfirmationModalOpen,
    setIsDeleteConfirmationModalOpen,
    handleEventActionsDelete,
    handleEventEdit,
  } = useCalendarModals();

  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const response = await fetch("/api/calendar/auth");

        const data = await response.json();

        if (data.access_token) {
          await fetchEvents(data.access_token);
        } else if (data.url) {
        }
      } catch (error) {
        console.error("Error checking Google Calendar connection:", error);
      }
    };

    checkGoogleConnection();
  }, [fetchEvents]);

  const handleEventClickWrapper = (clickInfo: EventClickArg) => {
    handleEventClick(clickInfo);
    setIsEventActionsModalOpen(true);
  };

  const handleDateSelectWrapper = (selectInfo: DateSelectArg) => {
    handleDateSelect(selectInfo);
    setIsCreateModalOpen(true);
  };

  const handleCreateEventWrapper = (
    title: string,
    selectedStartTime: string,
    selectedEndTime: string,
    isAllDay: boolean
  ) => {
    handleCreateEvent(title, selectedStartTime, selectedEndTime, isAllDay);
    setIsCreateModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSyncWithGoogle = async () => {
    if (calendarRef.current) {
      try {
        const response = await fetch("/api/calendar/auth");
        const data = await response.json();

        if (!data.access_token) {
          console.error("No access token available for sync");
          return;
        }

        await fetchEvents(data.access_token, true);
      } catch (error) {
        console.error("Error syncing with Google Calendar:", error);
      }
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      calendarApiRef.current = api;
    }
  }, []);

  const renderEventContent = (eventInfo: EventContentArg) => (
    <div className="bg-blue-500 text-white p-1 rounded inline-block w-full">
      <i>{eventInfo.event.title}</i>
    </div>
  );

  const handleModalOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) {
      setSelectedEvent(null);
    }
  };

  const handleEventActionsModalOpenChange = (open: boolean) => {
    setIsEventActionsModalOpen(open);
    if (!open) {
      setSelectedEvent(null);
    }
  };

  const handleDeleteConfirm = (
    event: EventApi | null,
    handleEventDelete: (event: EventApi) => void
  ) => {
    if (event) {
      handleEventDelete(event);
      setIsDeleteConfirmationModalOpen(false);
      setIsEventActionsModalOpen(false);
      setSelectedEvent(null);
      setSelectedDates(null);
    }
  };

  return (
    <div className="space-y-4">
      {(fetchError || googleState.error) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">
            {fetchError || googleState.error}
          </p>
        </div>
      )}
      <div className="flex justify-end gap-2">
        {accessToken && (
          <Button
            onClick={handleSyncWithGoogle}
            disabled={
              isFetching || googleState.isLoading || !googleState.isConnected
            }
          >
            {(isFetching || googleState.isLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sync with Google Calendar
          </Button>
        )}
      </div>
      <div
        className="[&_.fc-button-primary]:bg-blue-500 [&_.fc-button-primary]:border-blue-500 [&_.fc-button-primary]:text-white
                    [&_.fc-button-primary:hover]:bg-blue-600 [&_.fc-button-primary:hover]:border-blue-600
                    [&_.fc-button-primary:active]:bg-blue-700 [&_.fc-button-primary:active]:border-blue-700 h-[calc(100vh-200px)]"
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          firstDay={1}
          height="100%"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          select={handleDateSelectWrapper}
          eventContent={renderEventContent}
          eventClick={handleEventClickWrapper}
          eventsSet={handleEvents}
          events={events}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          forceEventDuration={true}
          defaultTimedEventDuration="01:00:00"
          displayEventTime={true}
          displayEventEnd={true}
          timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
      </div>

      {selectedDates && (
        <CalendarCreateEventModal
          open={isCreateModalOpen}
          onOpenChange={handleModalOpenChange}
          onSubmit={handleCreateEventWrapper}
          startDate={selectedDates.start}
          endDate={selectedDates.end}
          isAllDay={selectedDates.allDay}
          view={selectedDates.view}
          isEditMode={!!selectedEvent}
          initialTitle={selectedEvent?.title || ""}
        />
      )}

      {selectedEvent && (
        <CalendarEventActionsModal
          open={isEventActionsModalOpen && !isDeleteConfirmationModalOpen}
          onOpenChange={handleEventActionsModalOpenChange}
          event={selectedEvent}
          onDelete={() => handleEventActionsDelete(selectedEvent)}
          onEdit={() =>
            handleEventEdit(selectedEvent, selectedDates, setSelectedDates)
          }
        />
      )}

      {isEventActionsModalOpen && (
        <Dialog
          open={isDeleteConfirmationModalOpen}
          onOpenChange={setIsDeleteConfirmationModalOpen}
        >
          <DialogContent>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete ${selectedEvent?.title}? This
              action cannot be undone.`}
            </DialogDescription>
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsDeleteConfirmationModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  handleDeleteConfirm(selectedEvent, handleEventDelete)
                }
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
