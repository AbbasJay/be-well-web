import { useState } from "react";
import { EventApi, ViewApi } from "@fullcalendar/core";
import { SelectedDates } from "@/app/types/calendar";

export function useCalendarModals() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEventActionsModalOpen, setIsEventActionsModalOpen] = useState(false);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] =
    useState(false);

  const handleEventActionsDelete = (selectedEvent: EventApi | null) => {
    if (selectedEvent) {
      setIsDeleteConfirmationModalOpen(true);
    }
  };

  const handleEventEdit = (
    selectedEvent: EventApi | null,
    selectedDates: { view: ViewApi } | null,
    setSelectedDates: (dates: SelectedDates) => void
  ) => {
    if (selectedEvent && selectedDates?.view) {
      setIsEventActionsModalOpen(false);
      setSelectedDates({
        start: selectedEvent.startStr,
        end: selectedEvent.endStr,
        allDay: selectedEvent.allDay,
        view: selectedDates.view,
      });
      setIsCreateModalOpen(true);
    }
  };

  const handleDeleteConfirm = (
    selectedEvent: EventApi | null,
    handleEventDelete: (event: EventApi) => void
  ) => {
    if (selectedEvent) {
      handleEventDelete(selectedEvent);
      setIsDeleteConfirmationModalOpen(false);
      setIsEventActionsModalOpen(false);
    }
  };

  return {
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEventActionsModalOpen,
    setIsEventActionsModalOpen,
    isDeleteConfirmationModalOpen,
    setIsDeleteConfirmationModalOpen,
    handleEventActionsDelete,
    handleEventEdit,
    handleDeleteConfirm,
  };
}
