import FullCalendar from "@fullcalendar/react";
import { useRef, useEffect, useState } from "react";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  CalendarApi,
  EventApi,
} from "@fullcalendar/core";
import { useCalendarWithGoogle } from "../../hooks/calendar/useCalendarWithGoogle";
import { useCalendarModals } from "../../hooks/calendar/useCalendarModals";
import { useCalendar } from "@/app/contexts/CalendarContext";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import CalendarErrorAlert from "./CalendarErrorAlert";
import CalendarModals from "./CalendarModals";

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

  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentDate, setCurrentDate] = useState(new Date());

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
    setSelectedEvent(null);
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

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarApiRef.current) {
      calendarApiRef.current.changeView(view);
    }
  };

  const handleToday = () => {
    if (calendarApiRef.current) {
      calendarApiRef.current.today();
      setCurrentDate(new Date(calendarApiRef.current.getDate()));
    }
  };

  const handlePrev = () => {
    if (calendarApiRef.current) {
      calendarApiRef.current.prev();
      setCurrentDate(new Date(calendarApiRef.current.getDate()));
    }
  };

  const handleNext = () => {
    if (calendarApiRef.current) {
      calendarApiRef.current.next();
      setCurrentDate(new Date(calendarApiRef.current.getDate()));
    }
  };

  useEffect(() => {
    if (calendarApiRef.current) {
      setCurrentDate(new Date(calendarApiRef.current.getDate()));
    }
  }, [currentView]);

  const renderEventContent = (eventInfo: EventContentArg) => (
    <div className="flex items-center gap-2 bg-blue-500/90 text-white px-2 py-1 shadow-sm w-full">
      <CalendarIcon className="w-4 h-4 opacity-80" />
      <span className="truncate font-medium text-sm">
        {eventInfo.event.title}
      </span>
      {eventInfo.timeText && (
        <Badge className="ml-auto bg-white/20 text-xs font-semibold px-1.5 py-0.5">
          <Clock className="w-3 h-3 inline-block mr-1" />
          {eventInfo.timeText}
        </Badge>
      )}
    </div>
  );

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
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-y-auto w-full">
      <div className="sticky top-0 z-10 bg-white flex flex-col gap-2">
        <CalendarHeader
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onViewChange={handleViewChange}
          currentView={currentView}
          handleSyncWithGoogle={handleSyncWithGoogle}
          isFetching={isFetching}
          googleState={googleState}
          accessToken={accessToken}
          setIsCreateModalOpen={setIsCreateModalOpen}
        />
      </div>
      <CalendarErrorAlert message={fetchError || googleState.error || ""} />
      <CalendarGrid
        calendarRef={calendarRef}
        currentView={currentView}
        handleDateSelectWrapper={handleDateSelectWrapper}
        renderEventContent={renderEventContent}
        handleEventClickWrapper={handleEventClickWrapper}
        handleEvents={handleEvents}
        events={events}
        setCurrentDate={setCurrentDate}
      />
      <CalendarModals
        selectedDates={selectedDates}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        handleCreateEventWrapper={handleCreateEventWrapper}
        selectedEvent={selectedEvent}
        isEventActionsModalOpen={isEventActionsModalOpen}
        setIsEventActionsModalOpen={setIsEventActionsModalOpen}
        handleEventActionsDelete={handleEventActionsDelete}
        handleEventEdit={handleEventEdit}
        isDeleteConfirmationModalOpen={isDeleteConfirmationModalOpen}
        setIsDeleteConfirmationModalOpen={setIsDeleteConfirmationModalOpen}
        handleDeleteConfirm={handleDeleteConfirm}
        handleEventDelete={handleEventDelete}
        setSelectedEvent={setSelectedEvent}
        setSelectedDates={setSelectedDates}
      />
    </div>
  );
}
