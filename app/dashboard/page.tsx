"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {/* Add more dashboard content here */}
    </div>
  );
}
