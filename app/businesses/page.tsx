"use client";

import { useState, useEffect } from "react";
import { Business, User } from "@/lib/db/schema";
import { getUserFromToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/businesses", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch businesses");
      }

      const data = await response.json();

      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }
    fetchBusinesses();
  }, [isLoggedIn, router]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Businesses</h1>
        <Button asChild>
          <Link href="/businesses/new">Register New Business</Link>
        </Button>
      </div>
      {businesses.length === 0 ? (
        <p>You haven&apos;t registered any businesses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="grid">
              <div>
                <CardHeader>
                  <CardTitle>{business.name}</CardTitle>
                  <CardDescription>{business.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    {business.address}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {business.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {business.description}
                  </p>
                </CardContent>
              </div>
              <CardFooter className="items-end">
                <Button>
                  <Link href={`/businesses/${business.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
