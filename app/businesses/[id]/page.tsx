import { getBusinessById } from "@/lib/db/businesses";
import { notFound } from "next/navigation";
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

export default async function BusinessDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const business = await getBusinessById(parseInt(params.id));

    if (!business) {
      notFound();
    }

    return (
      <div>
        <Card className="w-full mb-4">
          <CardHeader>
            <CardTitle>{business.name}</CardTitle>
            <CardDescription>{business.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Phone:</strong> {business.phoneNumber}
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
              <strong>Description:</strong> {business.description}
            </p>
          </CardFooter>
        </Card>

        <div className="flex gap-2">
          <Button asChild>
            <Link href="/businesses">Back to Businesses</Link>
          </Button>

          <Button variant="destructive">Delete Business</Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching business details:", error);
    return <div>An error occurred while fetching business details.</div>;
  }
}
