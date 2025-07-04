import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import { useMemo } from "react";

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
  const dayNames = useMemo(
    () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    []
  );

  return (
    <div className="w-full">
      <div
        className="sticky top-[50px] z-30 bg-white w-full"
        style={{ overflow: "hidden" }}
      >
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              {dayNames.map((day) => (
                <th
                  key={day}
                  className="text-center py-3 font-semibold text-base bg-muted border-b border-border"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={false}
        initialView={currentView}
        firstDay={1}
        height="auto"
        contentHeight="auto"
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
        dayHeaderClassNames={() => "hidden"}
      />
    </div>
  );
}
