import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Class } from "@/lib/db/schema";
import { CLASS_TYPES } from "@/lib/constants/class-types";
import { getSortedClassTypes } from "@/app/utils/class";

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
    classType: initialData?.classType || "",
  });

  const [classTypeSearch, setClassTypeSearch] = useState(
    formData.classType || ""
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(formData);
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
      <Button type="submit">Submit</Button>
    </form>
  );
};
