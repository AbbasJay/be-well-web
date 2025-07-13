import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Class } from "@/lib/db/schema";
import { useEffect } from "react";
import { CLASS_TYPES } from "@/lib/constants/class-types";

interface ClassFormProps {
  businessId?: number;
  initialData?: Partial<Class>;
  onSuccess?: () => void;
  onSubmit?: (data: Partial<Class>) => void;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  businessId,
  initialData,
  onSuccess,
  onSubmit,
}) => {
  useEffect(() => {
    console.log("initialData:", initialData);
  }, [initialData]);
  const [formData, setFormData] = useState<
    Partial<Class> & { classType?: string }
  >({
    businessId: businessId,
    name: initialData?.name || "",
    description: initialData?.description || "",
    time: initialData?.time || "",
    duration: initialData?.duration || undefined,
    price: initialData?.price || undefined,
    instructor: initialData?.instructor || "",
    location: initialData?.location || "",
    capacity: initialData?.capacity || undefined,
    startDate: initialData?.startDate || "",
    slotsLeft: initialData?.slotsLeft || undefined,
    classType: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      classType: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Call the parent's onSubmit handler instead of making the API call directly
    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Fallback to direct API call if no onSubmit handler is provided
      try {
        const method = initialData?.id ? "PUT" : "POST";
        const url = initialData?.id
          ? `/api/classes/${initialData.id}`
          : `/api/classes`;

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to ${method === "POST" ? "create" : "update"} class`
          );
        }

        onSuccess?.();
      } catch (error) {
        console.error("Error submitting class form:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Name"
        type="text"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />

      <Select value={formData.classType} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Class Type" />
        </SelectTrigger>
        <SelectContent>
          {CLASS_TYPES.map((classType) => (
            <SelectItem key={classType.value} value={classType.value}>
              {classType.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        name="description"
        placeholder="Description"
        value={formData.description || ""}
        onChange={handleChange}
      />
      <Input
        name="time"
        placeholder="Time"
        type="time"
        value={formData.time || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="duration"
        placeholder="Duration (minutes)"
        type="number"
        value={formData.duration || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="price"
        placeholder="Price"
        type="number"
        value={formData.price || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="instructor"
        placeholder="Instructor"
        type="text"
        value={formData.instructor || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="location"
        placeholder="Location"
        type="text"
        value={formData.location || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="capacity"
        placeholder="Capacity"
        type="number"
        value={formData.capacity || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="startDate"
        placeholder="Start Date"
        type="date"
        value={formData.startDate || ""}
        onChange={handleChange}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
