import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";

interface CalendarGridProps {
  calendarRef: any;
  currentView: string;
  handleDateSelectWrapper: (info: any) => void;
  renderEventContent: (eventInfo: EventContentArg) => JSX.Element;
  handleEventClickWrapper: (info: any) => void;
  handleEvents: (events: any) => void;
  events: any;
  setCurrentDate: (date: Date) => void;
}

export default function CalendarGrid({
  calendarRef,
  currentView,
  handleDateSelectWrapper,
  renderEventContent,
  handleEventClickWrapper,
  handleEvents,
  events,
  setCurrentDate,
}: CalendarGridProps) {
  return (
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
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
          hour12: true,
        }}
        datesSet={(arg) => setCurrentDate(arg.start)}
        dayCellClassNames={() =>
          "!h-32 !min-h-[8rem] !max-h-40 !aspect-square border border-border bg-white"
        }
        dayHeaderClassNames={() => "bg-muted text-base font-semibold py-2"}
      />
    </div>
  );
}
