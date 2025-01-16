"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SideNav from "@/components/SideNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className="min-h-screen">
      <Header toggleNav={toggleNav} isNavOpen={isNavOpen} />
      <div className="pt-[72px]">
        <SideNav isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
        <main
          className={`p-4 ${
            isNavOpen ? "ml-64" : "ml-0"
          } transition-all duration-300`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
