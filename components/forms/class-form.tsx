import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class } from "@/lib/db/schema";
import { CLASS_TYPES } from "@/lib/constants/class-types";
import { getSortedClassTypes } from "@/app/utils/class";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface ClassFormProps {
  businessId?: number;
  initialData?: Partial<Class>;
  onSuccess?: () => void;
  onSubmit?: (data: FormData) => Promise<void>;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  businessId,
  initialData,
  onSuccess,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<
    Partial<Class> & { classType?: string; classTypeLabel?: string }
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
    photo: initialData?.photo || "",
    classType: initialData?.classType || "",
    classTypeLabel: initialData?.classTypeLabel || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedClassTypes = getSortedClassTypes(CLASS_TYPES);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClassTypeChange = (value: string) => {
    const selectedClassType = sortedClassTypes.find((ct) => ct.value === value);
    setFormData((prev) => ({
      ...prev,
      classType: value,
      classTypeLabel: selectedClassType?.label || value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (onSubmit) {
      const submitFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          key !== "photo" &&
          value !== ""
        ) {
          submitFormData.append(key, value.toString());
        }
      });

      if (selectedFile) {
        submitFormData.append("photo", selectedFile);
      }

      try {
        await onSubmit(submitFormData);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
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
      } finally {
        setIsSubmitting(false);
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

      <Select value={formData.classType} onValueChange={handleClassTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a class type" />
        </SelectTrigger>
        <SelectContent>
          {sortedClassTypes.map((classType) => (
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

      <div>
        <label className="block text-sm font-medium mb-2">Class Photo</label>
        <Input
          name="photo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {(previewUrl || formData.photo) && (
          <div className="mt-2">
            <Image
              src={previewUrl ?? formData.photo ?? ""}
              alt="Class photo preview"
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
};
