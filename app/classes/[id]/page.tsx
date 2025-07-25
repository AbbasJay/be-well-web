"use client";

import { useState, useEffect } from "react";
import { Class } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClassForm } from "@/components/forms/class-form";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function ClassesPage({ params }: { params: { id: string } }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchClasses = async () => {
      const response = await fetch(`/api/classes/${params.id}`);
      const data = await response.json();
      setClasses(data);
      setLoading(false);
    };
    fetchClasses();
  }, [params.id]);

  const handleDeleteSuccess = () => {
    if (classToDelete?.id) {
      setClasses((prevClasses) =>
        prevClasses.filter((classItem) => classItem.id !== classToDelete.id)
      );
    }
  };

  const handleBookClass = async (classItem: Class) => {
    if (!session) {
      alert("Please sign in to book a class");
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classItem.id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to book class");
        return;
      }

      const { class: updatedClass } = await response.json();

      setClasses((prevClasses) =>
        prevClasses.map((c) => (c.id === updatedClass.id ? updatedClass : c))
      );

      alert("Class booked successfully!");
    } catch (error) {
      console.error("Error booking class:", error);
      alert("Failed to book class");
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : classes.length > 0 ? (
        classes.map((item) => (
          <Card key={item.id} className="mb-4">
            <CardContent className="p-6">
              {item.photo && (
                <div className="mb-4">
                  <Image
                    src={item.photo}
                    alt={item.name}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">{item.name}</h2>
                <p className="text-muted-foreground mb-4">{item.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <p>
                  <strong>Duration:</strong> {item.duration} mins
                </p>
                <p>
                  <strong>Price:</strong> ${item.price}
                </p>
                <p>
                  <strong>Instructor:</strong> {item.instructor}
                </p>
                <p>
                  <strong>Location:</strong> {item.location}
                </p>
                <p>
                  <strong>Start Date:</strong> {item.startDate}
                </p>
                <p>
                  <strong>Time:</strong> {item.time}
                </p>
                <p>
                  <strong>Capacity:</strong> {item.capacity}
                </p>
                <p>
                  <strong>Slots Left:</strong> {item.slotsLeft}
                </p>
              </div>

              <div className="flex gap-2">
                {item.slotsLeft > 0 && (
                  <Button
                    onClick={() => handleBookClass(item)}
                    disabled={!session}
                    title={!session ? "Please sign in to book a class" : ""}
                  >
                    Book Class
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href={`/classes/${item.id}/bookings`}>
                    View Bookings
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setClassToDelete(item)}
                >
                  Delete Class
                </Button>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedClass(item)}>
                      Edit Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Class</DialogTitle>
                      <DialogDescription>
                        Update the class details below.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedClass && (
                      <ClassForm
                        businessId={item.businessId}
                        initialData={selectedClass}
                        onSuccess={() => setDialogOpen(false)}
                        onSubmit={async (formData: FormData) => {
                          try {
                            const response = await fetch(
                              `/api/classes/${selectedClass.id}`,
                              {
                                method: "PUT",
                                body: formData,
                              }
                            );

                            if (!response.ok) {
                              throw new Error("Failed to update class");
                            }

                            setDialogOpen(false);
                            // Refresh the classes list
                            const response2 = await fetch(
                              `/api/classes/${params.id}`
                            );
                            const data = await response2.json();
                            setClasses(data);
                          } catch (error) {
                            console.error("Error updating class:", error);
                          }
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No classes available for this business.</p>
      )}

      <DeleteDialog
        item={classToDelete}
        itemType="Class"
        itemName={classToDelete?.name || ""}
        deleteEndpoint={
          classToDelete?.id ? `/api/classes/${classToDelete.id}` : ""
        }
        isOpen={!!classToDelete}
        onOpenChange={(open) => !open && setClassToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
