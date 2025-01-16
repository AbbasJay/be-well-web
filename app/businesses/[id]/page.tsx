"use client";

import { PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Business, Class } from "@/lib/db/schema";
import { useSession } from "next-auth/react";
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
import { ClassForm } from "@/components/forms/class-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";

export default function BusinessDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

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
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchBusiness();
    }
  }, [params.id, router, session]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/classes/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }
      const data = await response.json();
      const filteredClasses = data.filter(
        (classs: Class) => classs.businessId === parseInt(params.id)
      );
      setClasses(filteredClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchClasses();
    }
  }, [params.id, session]);

  const handleDeleteSuccess = () => {
    router.push("/businesses");
  };

  if (!session) return null;
  if (loading) return <div>Loading...</div>;
  if (!business) return <div>Business not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{business.name}</h1>
        <Button asChild>
          <Link href="/businesses">Back to Businesses</Link>
        </Button>
      </div>
      <Card className="w-full mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{business.name}</CardTitle>
              <CardDescription>{business.address}</CardDescription>
            </div>

            <Button variant="outline" size="icon">
              <Link href={`/businesses/${params.id}/edit`}>
                <PencilIcon />
              </Link>
            </Button>
          </div>
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
          <p>
            <strong>Address:</strong> {business.address}
          </p>
          <p>
            <strong>Zip Code:</strong> {business.zipCode}
          </p>
          {classes.length > 0 && (
            <p>
              <strong>Classes:</strong> {classes.length}
            </p>
          )}
        </CardFooter>
      </Card>

      <div className="flex gap-2">
        {classes.length > 0 && (
          <Button asChild>
            <Link href={`/classes/${business.id}`}>View Classes</Link>
          </Button>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Class</Button>
          </DialogTrigger>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Add a New Class</DialogTitle>
              <DialogDescription>
                Fill out the form below to add a new class.
              </DialogDescription>
            </DialogHeader>
            <ClassForm
              businessId={business.id}
              onSuccess={() => {
                setDialogOpen(false);
                fetchClasses();
              }}
            />
          </DialogContent>
        </Dialog>

        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          Delete Business
        </Button>
      </div>

      <DeleteDialog
        item={business}
        itemType="Business"
        itemName={business?.name || ""}
        deleteEndpoint={`/api/businesses/${params.id}`}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
