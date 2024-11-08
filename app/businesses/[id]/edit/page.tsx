"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Business } from "@/lib/db/schema";
import { BusinessForm } from "@/components/forms/business-form/business-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditBusinessPage({
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

  const handleUpdate = async (updatedBusiness: Partial<Business>) => {
    try {
      const response = await fetch(`/api/businesses/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBusiness),
      });

      if (response.ok) {
        router.push(`/businesses/${params.id}`);
      } else {
        const errorData = await response.json();
        console.error("Failed to update business:", errorData.error);
      }
    } catch (error) {
      console.error("Error updating business:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!business) return <div>Business not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Business</h1>
        <Button asChild>
          <Link href={`/businesses/${params.id}`}>Cancel</Link>
        </Button>
      </div>
      <BusinessForm initialData={business} onSubmit={handleUpdate} />
    </div>
  );
}
