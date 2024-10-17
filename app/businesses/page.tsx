"use client";

import { useEffect, useState } from "react";
import { Business } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/businesses");
      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  if (loading) return <div>Loading...</div>;

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
