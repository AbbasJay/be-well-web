"use client";

import "./globals.css";

import { CalendarProvider } from "./contexts/CalendarContext";
import ClientLayout from "./ClientLayout";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CalendarProvider>
            <ClientLayout>{children}</ClientLayout>
          </CalendarProvider>
        </Providers>
      </body>
    </html>
  );
}
