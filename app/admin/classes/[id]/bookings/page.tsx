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
            {bookings.map((booking: any) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.user.name}</TableCell>
                <TableCell>{booking.user.email}</TableCell>
                <TableCell>{booking.createdAt}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.status === "active"
                        ? "default"
                        : booking.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {booking.cancelledAt ? booking.cancelledAt : "-"}
                </TableCell>
                <TableCell>{booking.cancellationReason || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
