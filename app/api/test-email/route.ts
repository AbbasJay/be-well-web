import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/utils/email";

export async function GET() {
  try {
    await sendBookingConfirmationEmail({
      userEmail: "abbasjabbar001@gmail.com",
      className: "Test Yoga Class",
      startDate: new Date().toLocaleDateString(),
      time: "10:00 AM",
      instructor: "Test Instructor",
      location: "Test Location",
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
