import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface BookingEmailData {
  userEmail: string;
  className: string;
  startDate: string;
  time: string;
  instructor: string;
  location: string;
  businessName?: string;
  cancellationPolicy?: string;
}

export async function sendBookingConfirmationEmail({
  userEmail,
  className,
  startDate,
  time,
  instructor,
  location,
  businessName = "BeWell",
  cancellationPolicy = "Please contact the business directly for cancellations or rescheduling.",
}: BookingEmailData) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: `Booking Confirmation - ${className}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
            .details { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #666; }
            .button { background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear valued customer,</p>
              <p>Thank you for booking a class with ${businessName}! Your booking has been confirmed.</p>
              
              <div class="details">
                <h2>Class Details:</h2>
                <ul>
                  <li><strong>Class:</strong> ${className}</li>
                  <li><strong>Date:</strong> ${startDate}</li>
                  <li><strong>Time:</strong> ${time}</li>
                  <li><strong>Instructor:</strong> ${instructor}</li>
                  <li><strong>Location:</strong> ${location}</li>
                </ul>
              </div>

              <h3>Important Information:</h3>
              <ul>
                <li>Please arrive 10 minutes before the class starts</li>
                <li>Bring comfortable clothing suitable for exercise</li>
                <li>Don't forget to bring water and a towel</li>
              </ul>

              <p><strong>Cancellation Policy:</strong><br>${cancellationPolicy}</p>

              <div class="footer">
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>${businessName} Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    throw error;
  }
}
