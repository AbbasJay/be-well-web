"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

// Dynamically import Calendar with no SSR
const Calendar = dynamic(() => import("../components/calendar/Calendar"), {
  ssr: false,
});

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Please try refreshing the page.
      </p>
    </div>
  );
}

const CalendarPageContent = () => {
  const { data: session, status } = useSession();
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "auth_error") {
      setError("Failed to connect to Google Calendar. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    // Check if we have a Google token
    const checkGoogleAuth = async () => {
      try {
        const response = await fetch("/api/calendar/auth", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.access_token) {
            setGoogleToken(data.access_token);
          }
        }
      } catch (error) {
        console.error("Error checking Google auth:", error);
        setError("Failed to check Google Calendar connection");
      } finally {
        setIsCheckingToken(false);
      }
    };

    if (session?.user) {
      checkGoogleAuth();
    } else {
      setIsCheckingToken(false);
    }
  }, [session]);

  if (status === "loading" || isCheckingToken) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <div>Please sign in to access the calendar.</div>;
  }

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar/auth");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error connecting to Google:", error);
      setError("Failed to initiate Google Calendar connection");
    } finally {
      setIsConnecting(false);
    }
  };

  if (!googleToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-semibold">Connect Google Calendar</h2>
        <p className="text-muted-foreground text-center max-w-md">
          To use the calendar features, you need to connect your Google Calendar
          account.
        </p>
        {error && (
          <p className="text-red-500 text-sm text-center max-w-md">{error}</p>
        )}
        <Button
          onClick={handleConnectGoogle}
          disabled={isConnecting}
          className="mt-4"
        >
          {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Connect with Google Calendar
        </Button>
      </div>
    );
  }

  return <Calendar accessToken={googleToken} />;
};

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <CalendarPageContent />
      </ErrorBoundary>
    </Suspense>
  );
}
