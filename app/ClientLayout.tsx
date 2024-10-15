"use client";

import { useAuth } from "./contexts/AuthContext";
import SideNav from "../components/SideNav";
import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    init();
  }, [checkAuth]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <div className="flex">
      {isLoggedIn ? (
        <>
          <SideNav />
          <div className="flex-1 p-4">{children}</div>
        </>
      ) : (
        <div className="flex-1">{children}</div>
      )}
    </div>
  );
}
