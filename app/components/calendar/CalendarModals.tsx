import CalendarCreateEventModal from "../modals/calendar-create-event-modal";
import CalendarEventActionsModal from "../modals/calendar-event-actions-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventApi } from "@fullcalendar/core";

interface CalendarModalsProps {
  selectedDates: any;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  handleCreateEventWrapper: (
    title: string,
    selectedStartTime: string,
    selectedEndTime: string,
    isAllDay: boolean
  ) => void;
  selectedEvent: any;
  isEventActionsModalOpen: boolean;
  setIsEventActionsModalOpen: (open: boolean) => void;
  handleEventActionsDelete: (event: any) => void;
  handleEventEdit: (event: any, dates: any, setDates: any) => void;
  isDeleteConfirmationModalOpen: boolean;
  setIsDeleteConfirmationModalOpen: (open: boolean) => void;
  handleDeleteConfirm: (
    event: EventApi | null,
    handleEventDelete: (event: EventApi) => void
  ) => void;
  handleEventDelete: (event: EventApi) => void;
  setSelectedEvent: (event: any) => void;
  setSelectedDates: (dates: any) => void;
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
  setSelectedEvent,
  setSelectedDates,
}: CalendarModalsProps) {
  return (
    <>
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
