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
import DeleteConfirmationModal from "../modals/delete-confirmation-modal";

export default function Calendar() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEventActionsModalOpen, setIsEventActionsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] =
    useState(false);
  const [selectedDates, setSelectedDates] = useState<{
    start: string;
    end: string;
    allDay: boolean;
    view: ViewApi;
  } | null>(null);

  let eventGuid = 0;

  function createEventId() {
    return String(eventGuid++);
  }

  function renderEventContent(eventInfo: EventContentArg) {
    return (
      <>
        <div className="bg-blue-500 text-white p-1 rounded inline-block">
          <i>{eventInfo.event.title}</i>
        </div>
      </>
    );
  }

  function handleWeekendsToggle() {
    setWeekendsVisible(!weekendsVisible);
  }

  function handleEventDelete() {
    if (selectedEvent) {
      setIsDeleteConfirmationModalOpen(true);
    }
  }

  function handleDeleteConfirmationModalCancel() {
    setIsDeleteConfirmationModalOpen(false);
  }

  function handleEventEdit() {
    // TODO: Implement edit functionality
    setIsEventActionsModalOpen(false);
  }

  function handleEventClick(clickInfo: EventClickArg) {
    setSelectedEvent(clickInfo.event);
    setIsEventActionsModalOpen(true);
  }

  function handleEvents(events: EventApi[]) {
    setCurrentEvents(events);
  }

  function handleDateSelect(selectInfo: DateSelectArg) {
    setSelectedDates({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      view: selectInfo.view,
    });
    setIsCreateModalOpen(true);
  }

  function handleCreateEvent(title: string, selectedTime: string) {
    if (selectedDates && title) {
      const calendarApi = selectedDates.view.calendar;

      const startDate = new Date(selectedDates.start);

      const endDate = new Date(selectedDates.start);

      if (selectedDates.view.type === "dayGridMonth") {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        startDate.setHours(hours, minutes, 0);
        endDate.setHours(hours + 1, minutes, 0);
      }

      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: startDate,
        end: endDate,
        allDay: false,
      });
      calendarApi.unselect();
    }
  }

  function handleDeleteConfirm() {
    if (selectedEvent) {
      selectedEvent.remove();
      setIsDeleteConfirmationModalOpen(false);
      setIsEventActionsModalOpen(false);
    }
  }

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
          select={handleDateSelect}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventsSet={handleEvents}
        />
      </div>
      {selectedDates && (
        <CalendarCreateEventModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateEvent}
          startDate={selectedDates.start}
          endDate={selectedDates.end}
          isAllDay={selectedDates.allDay}
          view={selectedDates.view}
        />
      )}
      {selectedEvent && (
        <CalendarEventActionsModal
          open={isEventActionsModalOpen}
          onOpenChange={setIsEventActionsModalOpen}
          event={selectedEvent}
          onDelete={handleEventDelete}
          onEdit={handleEventEdit}
        />
      )}
      <DeleteConfirmationModal
        open={isDeleteConfirmationModalOpen}
        onOpenChange={setIsDeleteConfirmationModalOpen}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteConfirmationModalCancel}
        title="Delete Event"
        description={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
        deleteButtonText="Delete Event"
        cancelButtonText="Cancel"
      />
    </div>
  );
}
