import CalendarCreateEventModal from "../modals/calendar-create-event-modal";
import CalendarEventActionsModal from "../modals/calendar-event-actions-modal";
import EditEventModal from "../modals/calendar-edit-event-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventApi, ViewApi } from "@fullcalendar/core";
import { SelectedDates } from "@/app/types/calendar";

interface CalendarModalsProps {
  selectedDates: SelectedDates | null;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  handleCreateEventWrapper: (
    title: string,
    selectedStartTime: string,
    selectedEndTime: string,
    isAllDay: boolean
  ) => void;
  selectedEvent: EventApi | null;
  isEventActionsModalOpen: boolean;
  setIsEventActionsModalOpen: (open: boolean) => void;
  handleEventActionsDelete: (event: EventApi) => void;
  handleEventEdit: (
    event: EventApi | null,
    dates: SelectedDates | null,
    setDates: (dates: SelectedDates | null) => void
  ) => void;
  isDeleteConfirmationModalOpen: boolean;
  setIsDeleteConfirmationModalOpen: (open: boolean) => void;
  handleDeleteConfirm: (
    event: EventApi | null,
    handleEventDelete: (event: EventApi) => void
  ) => void;
  handleEventDelete: (event: EventApi) => void;
  setSelectedEvent: (event: EventApi | null) => void;
  setSelectedDates: (dates: SelectedDates | null) => void;
}

export default function CalendarModals({
  selectedDates,
  isCreateModalOpen,
  setIsCreateModalOpen,
  handleCreateEventWrapper,
  selectedEvent,
  isEventActionsModalOpen,
  setIsEventActionsModalOpen,
  handleEventActionsDelete,
  handleEventEdit,
  isDeleteConfirmationModalOpen,
  setIsDeleteConfirmationModalOpen,
  handleDeleteConfirm,
  handleEventDelete,
  setSelectedDates,
}: CalendarModalsProps) {
  return (
    <>
      {selectedDates && isCreateModalOpen && !selectedEvent && (
        <CalendarCreateEventModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateEventWrapper}
          startDate={selectedDates.start}
          endDate={selectedDates.end}
          isAllDay={selectedDates.allDay}
          view={selectedDates.view as unknown as ViewApi}
        />
      )}
      {selectedDates && isCreateModalOpen && selectedEvent && (
        <EditEventModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateEventWrapper}
          startDate={selectedDates.start}
          endDate={selectedDates.end}
          isAllDay={selectedDates.allDay}
          view={selectedDates.view as unknown as ViewApi}
          initialTitle={selectedEvent?.title || ""}
        />
      )}

      {selectedEvent && (
        <CalendarEventActionsModal
          open={isEventActionsModalOpen && !isDeleteConfirmationModalOpen}
          onOpenChange={setIsEventActionsModalOpen}
          event={selectedEvent}
          onDelete={() => handleEventActionsDelete(selectedEvent)}
          onEdit={() => {
            const view = selectedDates?.view ||
              (selectedEvent as any)?._context?.viewApi || {
                type: "dayGridMonth",
              };
            const safeDates = selectedDates || {
              start: selectedEvent.startStr,
              end: selectedEvent.endStr,
              allDay: selectedEvent.allDay,
              view,
            };
            handleEventEdit(selectedEvent, safeDates, setSelectedDates);
          }}
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
              {`Are you sure you want to delete ${selectedEvent?.title}? This action cannot be undone.`}
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
    </>
  );
}
