"use client";

import { ReactNode, useState } from "react";
import SideNav from "@/components/SideNav";
import Header from "@/components/Header";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

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
          style={{ marginTop: "76px" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
