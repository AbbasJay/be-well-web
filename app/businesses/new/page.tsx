import { BusinessForm } from "@/components/forms/business-form/business-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewBusinessPage() {
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
      <BusinessForm />
    </div>
  );
}
