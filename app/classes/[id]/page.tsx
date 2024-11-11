"use client";

import { useState, useEffect } from "react";
import { Class } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

export default function ClassesPage({
  params,
}: {
  params: { id: string; data: any };
}) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const response = await fetch(`/api/classes/${params.id}`);
      const data = await response.json();
      setClasses(data);
      setLoading(false);
    };
    fetchClasses();
  }, [params.id]);

  const handleDelete = async (classId: number) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setClasses((prevClasses) =>
          prevClasses.filter((classItem) => classItem.id !== classId)
        );
      } else {
        console.error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const handleEditSubmit = async (updatedClass: Partial<Class>) => {
    try {
      const response = await fetch(`/api/classes/${selectedClass?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedClass),
      });

      if (response.ok) {
        setClasses((prevClasses) =>
          prevClasses.map((classItem) =>
            classItem.id === selectedClass?.id
              ? { ...classItem, ...updatedClass }
              : classItem
          )
        );
        setSelectedClass(null);
      } else {
        console.error("Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : classes.length > 0 ? (
        classes.map((item) => (
          <Card key={item.id} className="mb-4">
            <CardHeader>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
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

              <div className="flex gap-2 mt-4">
                <Button
                  variant="destructive"
                  onClick={() => item.id && handleDelete(item.id)}
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
                        onSubmit={handleEditSubmit}
                        onSuccess={() => setDialogOpen(false)}
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
    </div>
  );
}
