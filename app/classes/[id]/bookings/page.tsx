"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

interface Booking {
  booking: {
    id: number;
    status: "active" | "cancelled";
    createdAt: string;
    cancelledAt: string | null;
    cancellationReason: string | null;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ClassBookingsPage({
  params,
}: {
  params: { id: string };
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/classes/${params.id}/bookings`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchBookings();
    }
  }, [params.id, session]);

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/classes/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to cancel booking");
        return;
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.booking.id === bookingId
            ? {
                ...booking,
                booking: {
                  ...booking.booking,
                  status: "cancelled" as const,
                  cancelledAt: new Date().toISOString(),
                  cancellationReason: "Cancelled by admin",
                },
              }
            : booking
        )
      );

      alert("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Class Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found for this class.</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cancellation Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(({ booking, user }) => (
                <TableRow key={booking.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {dayjs(booking.createdAt).format("LLL")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "active" ? "default" : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.cancelledAt
                      ? dayjs(booking.cancelledAt).format("LLL")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {booking.status === "active" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
