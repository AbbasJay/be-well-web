"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from "../components/calendar/Calendar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CalendarPageContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        const currentOrigin = window.location.origin;
        const updatedUrl = data.url.replace(
          "http://localhost:3000",
          currentOrigin
        );
        window.location.href = updatedUrl;
      }
    } catch (error) {
      console.error("Error connecting to Google:", error);
      setError("Failed to initiate Google Calendar connection");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignOutGoogle = async () => {
    setIsSigningOut(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar/auth", { method: "DELETE" });
      if (response.ok) {
        setGoogleToken(null);
        router.replace(window.location.pathname + window.location.search);
      } else {
        setError("Failed to sign out of Google Calendar");
      }
    } catch (error) {
      setError("Failed to sign out of Google Calendar");
    } finally {
      setIsSigningOut(false);
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

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={handleSignOutGoogle}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Sign out of Google Calendar
        </Button>
      </div>
      <Calendar accessToken={googleToken} />
    </>
  );
};

export default function CalendarPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarPageContent />
    </Suspense>
  );
}
