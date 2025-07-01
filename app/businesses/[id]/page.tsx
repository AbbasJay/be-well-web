"use client";

import {
  PencilIcon,
  Trash2Icon,
  BookOpenIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import Image from "next/image";
import { ClassForm } from "@/components/forms/class-form";
import { formatClassDateTime } from "@/app/utils/calendar";

export default function BusinessDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  const fetchClasses = useCallback(async () => {
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
  }, [params.id]);

  useEffect(() => {
    if (session) {
      fetchClasses();
    }
  }, [params.id, session, fetchClasses]);

  const handleDeleteSuccess = () => {
    router.push("/businesses");
  };

  if (!session) return null;
  if (loading) return <div>Loading...</div>;
  if (!business) return <div>Business not found</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Column: Business Info */}
      <div className="md:w-1/3 w-full space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <Button asChild size="sm" variant="outline">
            <Link href="/businesses">Back</Link>
          </Button>
        </div>
        <Card className="w-full mb-4">
          <CardContent className="p-6">
            <div className="mb-4">
              <span className="block text-lg font-semibold">
                {business.name}
              </span>
              <span className="block text-sm text-muted-foreground">
                {business.address}
              </span>
            </div>
            {business.photo && (
              <div className="mb-4">
                <Image
                  src={business.photo}
                  alt={business.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="space-y-1 text-sm">
              <p>
                <strong>Description:</strong> {business.description}
              </p>
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
              <p>
                <strong>Classes:</strong> {classes.length}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" variant="outline">
                <Link href={`/businesses/${business.id}/edit`}>
                  <PencilIcon className="w-4 h-4 mr-1" /> Edit
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 hover:text-red-700"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2Icon className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Classes List & Add Class */}
      <div className="md:w-2/3 w-full space-y-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Classes</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                + Add New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Add a New Class</DialogTitle>
                <DialogDescription>
                  Fill out the form below to add a new class. It will
                  automatically create a calendar event.
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
        </div>
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="text-muted-foreground text-lg">
              No classes available for this business.
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  + Add Your First Class
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background">
                <DialogHeader>
                  <DialogTitle>Add a New Class</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to add a new class. It will
                    automatically create a calendar event.
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="w-full shadow-sm flex flex-col h-full"
              >
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate text-lg">
                      {classItem.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {formatClassDateTime(classItem.startDate, classItem.time)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="truncate-2-lines text-sm mb-2">
                    {classItem.description}
                  </p>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3 text-xs mb-2 mt-auto">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" /> {classItem.slotsLeft}/
                      {classItem.capacity} slots
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" /> {classItem.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpenIcon className="w-4 h-4" />{" "}
                      {classItem.instructor}
                    </span>
                  </div>
                  <div className="flex gap-2 min-h-[40px]">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/classes/${classItem.id}/bookings`}>
                        <BookOpenIcon className="w-4 h-4 mr-1" /> Bookings
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditClass(classItem);
                        setEditDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 hover:text-red-700"
                      onClick={async () => {
                        await fetch(`/api/classes/${classItem.id}`, {
                          method: "DELETE",
                        });
                        fetchClasses();
                      }}
                    >
                      <Trash2Icon className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

      {/* Edit Class Modal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update the class details below.
            </DialogDescription>
          </DialogHeader>
          {editClass && (
            <ClassForm
              businessId={editClass.businessId}
              initialData={editClass}
              onSuccess={() => {
                setEditDialogOpen(false);
                setEditClass(null);
                fetchClasses();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
