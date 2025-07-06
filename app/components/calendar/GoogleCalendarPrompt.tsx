import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const GoogleCalendarPrompt = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/calendar/auth");
        if (res.ok) {
          const data = await res.json();
          setIsConnected(!!data.access_token);
        } else {
          setIsConnected(false);
        }
      } catch {
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };
    checkConnection();
  }, []);

  const handleConnectGoogle = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("addClass", "1");
    const redirect = encodeURIComponent(url.toString());
    const res = await fetch(`/api/calendar/auth?redirect=${redirect}`);
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  if (loading) return null;
  if (isConnected) {
    return (
      <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
        <b>Google Calendar Connected:</b> New classes will be added to your
        Google Calendar automatically.
      </div>
    );
  }
  return (
    <div className="mb-4 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 text-sm flex flex-col gap-2">
      <div>
        <b>Connect your Google Calendar</b> to automatically add new classes as
        events. You can still create classes without connecting, but they
        won&apos;t sync to your calendar.
      </div>
      <Button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
        onClick={handleConnectGoogle}
      >
        Connect Google Calendar
      </Button>
    </div>
  );
};

export default GoogleCalendarPrompt;
