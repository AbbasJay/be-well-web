"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function BusinessDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/businesses/${params.id}`);
        if (!response.ok) {
          throw new Error("Business not found");
        }
        const data = await response.json();
        setBusiness(data);
      } catch (error) {
        console.error("Error fetching business details:", error);
        router.push("/404"); // Redirect to a 404 page if business not found
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [params.id, router]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/businesses/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        router.push("/businesses");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete business:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!business) return <div>Business not found</div>;

  return (
    <div>
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>{business.name}</CardTitle>
          <CardDescription>{business.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Description:</strong> {business.description}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 items-start">
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
            <strong>Phone:</strong> {business.phoneNumber}
          </p>
        </CardFooter>
      </Card>

      <div className="flex gap-2">
        <Button asChild>
          <Link href="/businesses">Back to Businesses</Link>
        </Button>

        <Button variant="destructive" onClick={handleDelete}>
          Delete Business
        </Button>
      </div>
    </div>
  );
}
