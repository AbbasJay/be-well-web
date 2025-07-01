import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRef, useEffect, useState } from "react";
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
import {
  Calendar as CalendarIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Grid,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex items-center gap-2 bg-blue-500/90 text-white px-2 py-1 rounded-md shadow-sm w-full">
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
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex flex-col gap-2 mb-4">
        <TooltipProvider>
          <div className="flex items-center justify-between gap-4 py-2 px-2 rounded-xl bg-white border border-border">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-7 h-7 text-blue-600" />
              <span className="text-2xl font-bold tracking-tight">
                My Calendar
              </span>
              <span className="text-muted-foreground text-lg font-medium ml-2">
                {currentDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="rounded-full p-2 hover:bg-accent transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="rounded-full p-2 hover:bg-accent transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleToday}
                    className="rounded-full p-2 hover:bg-accent transition"
                  >
                    <span className="sr-only">Today</span>
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Today</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-full p-2 hover:bg-accent transition">
                        <Grid className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewChange("dayGridMonth")}
                      >
                        Month View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleViewChange("timeGridWeek")}
                      >
                        Week View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleViewChange("timeGridDay")}
                      >
                        Day View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>Change View</TooltipContent>
              </Tooltip>
              {accessToken && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleSyncWithGoogle}
                      disabled={
                        isFetching ||
                        googleState.isLoading ||
                        !googleState.isConnected
                      }
                      className="rounded-full p-2 hover:bg-blue-100 disabled:opacity-50 transition"
                    >
                      {isFetching || googleState.isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Sync with Google Calendar</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
      {(fetchError || googleState.error) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">
            {fetchError || googleState.error}
          </p>
        </div>
      )}
      <div className="flex-grow h-0 rounded-2xl overflow-hidden border border-border bg-background">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={false}
          initialView={currentView}
          firstDay={1}
          height="100%"
          contentHeight="100%"
          aspectRatio={1.35}
          dayMaxEventRows={6}
          fixedWeekCount={false}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={5}
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
          datesSet={(arg) => setCurrentDate(arg.start)}
          dayCellClassNames={() =>
            "!h-32 !min-h-[8rem] !max-h-40 !aspect-square border border-border bg-white"
          }
          dayHeaderClassNames={() => "bg-muted text-base font-semibold py-2"}
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
