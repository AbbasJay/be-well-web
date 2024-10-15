"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function LogoutButton() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();

  const handleLogout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
    });

    if (response.ok) {
      setIsLoggedIn(false);
      router.push("/auth");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
