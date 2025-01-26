import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import CalendarSidebar from "./CalendarSidebar";
import {
  DateSelectArg,
  EventClickArg,
  EventApi,
  EventContentArg,
  ViewApi,
} from "@fullcalendar/core";
import CalendarCreateEventModal from "../modals/calendar-create-event-modal";
import CalendarEventActionsModal from "../modals/calendar-event-actions-modal";
import { useCalendarEvents } from "../../hooks/calendar/useCalendarEvents";
import { useCalendarModals } from "../../hooks/calendar/useCalendarModals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);

  const {
    currentEvents,
    selectedEvent,
    selectedDates,
    setSelectedDates,
    handleEvents,
    handleEventClick,
    handleDateSelect,
    handleCreateEvent,
    handleEventDelete,
  } = useCalendarEvents();

  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEventActionsModalOpen,
    setIsEventActionsModalOpen,
    isDeleteConfirmationModalOpen,
    setIsDeleteConfirmationModalOpen,
    handleEventActionsDelete,
    handleEventEdit,
    handleDeleteConfirm,
  } = useCalendarModals();

  const handleWeekendsToggle = () => setWeekendsVisible(!weekendsVisible);

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
    selectedTime: string,
    isAllDay: boolean
  ) => {
    handleCreateEvent(title, selectedTime, isAllDay);
    setIsCreateModalOpen(false);
  };

  const renderEventContent = (eventInfo: EventContentArg) => (
    <div className="bg-blue-500 text-white p-1 rounded inline-block">
      <i>{eventInfo.event.title}</i>
    </div>
  );

  return (
    <div>
      <CalendarSidebar
        weekendsVisible={weekendsVisible}
        handleWeekendsToggle={handleWeekendsToggle}
        currentEvents={currentEvents}
      />
      <div
        className="[&_.fc-button-primary]:bg-blue-500 [&_.fc-button-primary]:border-blue-500 [&_.fc-button-primary]:text-white
                      [&_.fc-button-primary:hover]:bg-blue-600 [&_.fc-button-primary:hover]:border-blue-600
                      [&_.fc-button-active]:bg-blue-700 [&_.fc-button-active]:border-blue-700"
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={weekendsVisible}
          select={handleDateSelectWrapper}
          eventContent={renderEventContent}
          eventClick={handleEventClickWrapper}
          eventsSet={handleEvents}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          forceEventDuration={true}
          defaultTimedEventDuration="01:00:00"
          displayEventTime={true}
          displayEventEnd={true}
        />
      </div>
      {selectedDates && (
        <CalendarCreateEventModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
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
          onOpenChange={setIsEventActionsModalOpen}
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
              Are you sure you want to delete "{selectedEvent?.title}"? This
              action cannot be undone.
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
