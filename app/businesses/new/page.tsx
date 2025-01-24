"use client";

import { BusinessForm } from "@/components/forms/business-form/business-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewBusinessPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleCreate = async (formData: FormData) => {
    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        body: formData,
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

  if (!session) {
    return <div>Loading...</div>;
  }

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
