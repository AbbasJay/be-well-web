"use client";

import Header from "@/components/Header";
import SideNav from "@/components/SideNav";
import { useSession } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-[72px]">
        {isAuthenticated && <SideNav isOpen={true} setIsOpen={() => {}} />}
        <main
          className={`p-4 transition-all duration-300${
            isAuthenticated ? " ml-64" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
