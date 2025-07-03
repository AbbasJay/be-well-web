import {
  Calendar as CalendarIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Grid,
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
  googleState: any;
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
      <div className="flex items-center justify-between gap-4 py-2 px-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-lg font-medium ml-2">
            {currentDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-full p-2 hover:bg-blue-100 transition"
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
            className="rounded-full p-2 hover:bg-accent transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className="rounded-full p-2 hover:bg-accent transition"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToday}
                className="rounded-full p-2 hover:bg-accent transition"
                aria-label="Today"
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
                  <button
                    className="rounded-full p-2 hover:bg-accent transition"
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
                        ? "font-bold bg-accent"
                        : ""
                    }
                  >
                    Month View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onViewChange("timeGridWeek")}
                    className={
                      currentView === "timeGridWeek"
                        ? "font-bold bg-accent"
                        : ""
                    }
                  >
                    Week View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onViewChange("timeGridDay")}
                    className={
                      currentView === "timeGridDay" ? "font-bold bg-accent" : ""
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
                  className="rounded-full p-2 hover:bg-blue-100 disabled:opacity-50 transition"
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
