"use client";

import { BusinessForm } from "@/components/forms/business-form/business-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Business } from "@/lib/db/schema";
import { useRouter } from "next/navigation";

export default function NewBusinessPage() {
  const router = useRouter();

  const handleCreate = async (newBusiness: Partial<Business>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBusiness),
      });

      if (response.ok) {
        console.log("Business added successfully");
        router.push("/businesses");
      } else {
        const errorData = await response.json();
        console.error("Failed to add business:", errorData.error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Register New Business</h1>
        <div>
          <Button asChild>
            <Link href="/businesses">Back to My Businesses</Link>
          </Button>
        </div>
      </div>
      <BusinessForm onSubmit={handleCreate} />
    </div>
  );
}
