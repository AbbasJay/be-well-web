import { notFound } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

async function getBookings(classId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/classes/${classId}/bookings`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
}

export default async function ClassBookingsPage({
  params,
}: {
  params: { id: string };
}) {
  const bookings = await getBookings(params.id);

  return (
    <div className="container mx-auto py-10">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Booking Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cancellation Date</TableHead>
              <TableHead>Cancellation Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking: Booking) => (
              <TableRow key={booking.booking.id}>
                <TableCell>{booking.user.name}</TableCell>
                <TableCell>{booking.user.email}</TableCell>
                <TableCell>{booking.booking.createdAt}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.booking.status === "active"
                        ? "default"
                        : booking.booking.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {booking.booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {booking.booking.cancelledAt
                    ? booking.booking.cancelledAt
                    : "-"}
                </TableCell>
                <TableCell>
                  {booking.booking.cancellationReason || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
