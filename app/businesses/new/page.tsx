import { BusinessForm } from "@/components/forms/business-form/business-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewBusinessPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Register New Business</h1>
      <BusinessForm />
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/businesses">Back to My Businesses</Link>
        </Button>
      </div>
    </div>
  );
}
