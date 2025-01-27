"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Calendar from "../components/calendar/Calendar";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 space-y-4">
          <h1 className="text-2xl font-bold text-center">
            Connect with Google Calendar
          </h1>
          <p className="text-gray-600 text-center">
            Sign in with your Google account to sync and manage your calendar
            events
          </p>
          <Button onClick={() => signIn("google")} className="w-full">
            Sign in with Google
          </Button>
        </Card>
      </div>
    );
  }

  return <Calendar accessToken={session.accessToken} />;
}
