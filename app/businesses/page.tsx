import { getUserFromToken } from "@/lib/auth";
import { getBusinessesByUserId } from "@/lib/db/businesses";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BusinessesPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return <div>Please log in to view your businesses.</div>;
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return <div>User not found.</div>;
  }

  const businesses = await getBusinessesByUserId(user.id);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">My Businesses</h1>
      {businesses.length === 0 ? (
        <p>You haven&apos;t registered any businesses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader>
                <CardTitle>{business.name}</CardTitle>
                <CardDescription>{business.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{business.address}</p>
                <p className="text-sm text-gray-600 mb-2">
                  {business.phoneNumber}
                </p>
                <p className="text-sm text-gray-600">{business.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/businesses/${business.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8">
        <Button asChild>
          <Link href="/businesses/new">Register New Business</Link>
        </Button>
      </div>
    </div>
  );
}
