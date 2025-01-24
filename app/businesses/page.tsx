"use client";

import { useState, useEffect } from "react";
import { Business } from "@/lib/db/schema";
import { useSession } from "next-auth/react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import Image from "next/image";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const { data: session } = useSession();

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/businesses");
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
    if (session) {
      fetchBusinesses();
    }
  }, [session]);

  const handleDeleteSuccess = () => {
    if (businessToDelete) {
      setBusinesses(businesses.filter((b) => b.id !== businessToDelete.id));
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

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
                {business.photo && (
                  <div
                    className="relative w-full h-48 cursor-pointer pt-6 pl-6 pr-6"
                    onClick={() =>
                      setSelectedImage({
                        url: business.photo!,
                        alt: business.name,
                      })
                    }
                  >
                    <Image
                      src={business.photo}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
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
              <CardFooter className="gap-2">
                <Button asChild>
                  <Link href={`/businesses/${business.id}`}>View Details</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setBusinessToDelete(business)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="sm:max-w-[720px] p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative w-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="w-full h-auto rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteDialog
        item={businessToDelete}
        itemType="Business"
        itemName={businessToDelete?.name || ""}
        deleteEndpoint={
          businessToDelete?.id ? `/api/businesses/${businessToDelete.id}` : ""
        }
        isOpen={!!businessToDelete}
        onOpenChange={(open) => !open && setBusinessToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
