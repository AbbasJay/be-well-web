"use client";

import { useEffect, useState } from "react";
import { Business } from "@/lib/db/schema";
import { getUserFromToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getBusinessesByUserId } from "@/lib/db/businesses";
import { cookies } from "next/headers";

export default function MyBusinesses({ business }: { business: Business }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const token = cookies().get("token")?.value;
      if (token) {
        const user = await getUserFromToken(token);
        if (user) {
          const businesses = await getBusinessesByUserId(user.id);
          setBusinesses(businesses);
        }
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Businesses</h1>
      {businesses.map((business) => (
        <div key={business.id}>
          <h1 className="text-2xl font-bold mb-4">{business.name}</h1>
          <p>
            <strong>Address:</strong> {business.address}
          </p>
          <p>
            <strong>Phone:</strong> {business.phoneNumber}
          </p>
          <p>
            <strong>Email:</strong> {business.email}
          </p>
          <p>
            <strong>Type:</strong> {business.type}
          </p>
          <p>
            <strong>Hours:</strong> {business.hours}
          </p>
          <p>
            <strong>Description:</strong> {business.description}
          </p>
        </div>
      ))}
    </div>
  );
}
