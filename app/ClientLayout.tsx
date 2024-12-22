"use client";

import { ReactNode, useState, useEffect } from "react";
import SideNav from "@/components/SideNav";
import Header from "@/components/Header";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isNavOpen');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('isNavOpen', JSON.stringify(isNavOpen));
  }, [isNavOpen]);

  return (
    <div className="flex">
      <SideNav isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
      <div className="flex flex-col flex-grow">
        <Header
          toggleNav={() => setIsNavOpen(!isNavOpen)}
          isNavOpen={isNavOpen}
        />
        <main
          className={`flex-grow transition-all duration-300 ${
            isNavOpen ? "ml-64" : "ml-0"
          }`}
          style={{ marginTop: "72px" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
