"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Class } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BusinessClassesPage({
  params,
}: {
  params: { id: string };
}) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`/api/businesses/${params.id}/classes`);
        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [params.id, router]);

  if (loading) return <div>Loading...</div>;

  if (classes.length === 0) return <div>No classes available</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        Classes for Business {params.id}
      </h1>
      <div className="grid grid-cols-1 gap-4">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="w-full">
            <CardHeader>
              <CardTitle>{classItem.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Description:</strong> {classItem.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button asChild>
        <Link href={`/businesses/${params.id}`}>Back to Business</Link>
      </Button>
    </div>
  );
}
