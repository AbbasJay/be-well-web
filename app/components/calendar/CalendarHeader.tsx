import { RefreshCw, ChevronLeft, ChevronRight, Grid } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: string) => void;
  currentView: string;
  handleSyncWithGoogle: () => void;
  isFetching: boolean;
  googleState: {
    isLoading: boolean;
    isConnected: boolean;
  };
  accessToken?: string;
  setIsCreateModalOpen: (open: boolean) => void;
}

export default function CalendarHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  currentView,
  handleSyncWithGoogle,
  isFetching,
  googleState,
  accessToken,
  setIsCreateModalOpen,
}: CalendarHeaderProps) {
  return (
    <TooltipProvider>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md flex items-center justify-between gap-6 py-4 px-6 shadow-sm rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold text-foreground/90 ml-2 tracking-tight select-none">
            {currentDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-base text-muted-foreground font-normal ml-3 select-none">
            {currentDate.toLocaleDateString(undefined, { weekday: "long" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-full p-2 hover:bg-blue-100/60 transition shadow-none border-none focus:ring-2 focus:ring-blue-200"
            aria-label="Create Event"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Button>
          <button
            onClick={onPrev}
            className="rounded-full p-2 hover:bg-accent/60 transition shadow-none border-none focus:ring-2 focus:ring-blue-200"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className="rounded-full p-2 hover:bg-accent/60 transition shadow-none border-none focus:ring-2 focus:ring-blue-200"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <Button
            variant="default"
            size="sm"
            onClick={onToday}
            className="rounded-full px-4 py-2 ml-1 font-medium text-base"
            aria-label="Today"
          >
            Today
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-full p-2 hover:bg-accent/60 transition shadow-none border-none focus:ring-2 focus:ring-blue-200"
                    aria-label="Change View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onViewChange("dayGridMonth")}
                    className={
                      currentView === "dayGridMonth"
                        ? "font-bold bg-accent/40"
                        : ""
                    }
                  >
                    Month View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onViewChange("timeGridWeek")}
                    className={
                      currentView === "timeGridWeek"
                        ? "font-bold bg-accent/40"
                        : ""
                    }
                  >
                    Week View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onViewChange("timeGridDay")}
                    className={
                      currentView === "timeGridDay"
                        ? "font-bold bg-accent/40"
                        : ""
                    }
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
                  className="rounded-full p-2 hover:bg-blue-100/60 disabled:opacity-50 transition shadow-none border-none focus:ring-2 focus:ring-blue-200"
                  aria-label="Sync with Google Calendar"
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
  );
}
