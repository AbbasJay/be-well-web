import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

const getLabelFromValue = (value: string | undefined) => {
  if (!value) return "";
  const found = CLASS_TYPES.find((ct) => ct.value === value);
  return found ? found.label : value;
};

export const ClassForm: React.FC<ClassFormProps> = ({
  businessId,
  initialData,
  onSuccess,
  onSubmit,
}) => {
  useEffect(() => {}, [initialData]);
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
    photo: initialData?.photo || "",
    classType: initialData?.classType || "",
  });

  // Use the label for the initial classTypeSearch
  const [classTypeSearch, setClassTypeSearch] = useState(
    getLabelFromValue(initialData?.classType || undefined)
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMouseDownOnDropdown, setIsMouseDownOnDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredClassTypes = getSortedClassTypes(CLASS_TYPES).filter(
    (classType) =>
      classType.label.toLowerCase().includes(classTypeSearch.toLowerCase())
  );

  const handleClassTypeSelect = (value: string, label: string) => {
    setFormData((prev) => ({ ...prev, classType: value }));
    setClassTypeSearch(label);
    setShowDropdown(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!isMouseDownOnDropdown) {
        setShowDropdown(false);
      }
    }, 100);
  };

  const handleDropdownMouseDown = () => {
    setIsMouseDownOnDropdown(true);
  };

  const handleDropdownMouseUp = () => {
    setIsMouseDownOnDropdown(false);
    inputRef.current?.focus();
  };
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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

    const matchedClassType =
      classTypeSearch.trim() === ""
        ? null
        : CLASS_TYPES.find(
            (ct) =>
              ct.label.toLowerCase() === classTypeSearch.trim().toLowerCase()
          );

    if (classTypeSearch.trim() !== "" && !matchedClassType) {
      setClassTypeSearch("");
      setFormData((prev) => ({ ...prev, classType: "" }));
      setIsSubmitting(false);
      return;
    }

    const capitalizedFormData = {
      ...formData,
      classType: matchedClassType ? matchedClassType.value : "",
    };

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
          body: JSON.stringify(capitalizedFormData),
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
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Class Type"
          value={classTypeSearch}
          onChange={(e) => {
            setClassTypeSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleInputBlur}
          autoComplete="off"
          required
        />
        {showDropdown && filteredClassTypes.length > 0 && (
          <div
            className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto"
            onMouseDown={handleDropdownMouseDown}
            onMouseUp={handleDropdownMouseUp}
          >
            {filteredClassTypes.map((classType) => (
              <div
                key={classType.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  formData.classType === classType.value ? "bg-gray-100" : ""
                }`}
                onMouseDown={() =>
                  handleClassTypeSelect(classType.value, classType.label)
                }
              >
                {classType.label}
              </div>
            ))}
          </div>
        )}
      </div>
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
