interface CalendarErrorAlertProps {
  message?: string;
}

export default function CalendarErrorAlert({
  message,
}: CalendarErrorAlertProps) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
