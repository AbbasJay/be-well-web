"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Business } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { useLoadScript, Libraries } from "@react-google-maps/api";

type BusinessFormProps = {
  initialData?: Partial<Business>;
  onSubmit: (data: FormData) => Promise<void>;
};

const libraries: Libraries = ["places"];

export const BusinessForm: React.FC<BusinessFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [formData, setFormData] = useState<Partial<Business>>({
    name: initialData?.name || "",
    address: initialData?.address || "",
    phoneNumber: initialData?.phoneNumber || "",
    description: initialData?.description || "",
    hours: initialData?.hours || "",
    email: initialData?.email || "",
    type: initialData?.type || "",
    country: initialData?.country || "",
    zipCode: initialData?.zipCode || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    photo: initialData?.photo || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      type: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (loadError) {
      console.log("Load Error: ", loadError);
      return;
    }

    const updateAddressFormData = (place: google.maps.places.PlaceResult) => {
      const addressComponents = place.address_components || [];

      const componentMap: { [key: string]: string } = {
        subPremise: "",
        premise: "",
        street_number: "",
        route: "",
        country: "",
        postal_code: "",
        zipCode: "",
        state: "",
        administrative_area_level_2: "",
        administrative_area_level_1: "", // State
      };

      addressComponents.forEach((component) => {
        const componentType = component.types[0];
        if (componentMap.hasOwnProperty(componentType)) {
          componentMap[componentType] = component.long_name;
        }
      });

      const formattedAddress =
        `${componentMap.subPremise} ${componentMap.premise} ${componentMap.street_number} ${componentMap.route}`.trim();
      const latitude = place.geometry?.location?.lat()?.toString() || null;
      const longitude = place.geometry?.location?.lng()?.toString() || null;

      console.log("autocompleted address", {
        address: formattedAddress,
        country: componentMap.country,
        zipCode: componentMap.postal_code,
        city: componentMap.administrative_area_level_2,
        state: componentMap.administrative_area_level_1,
        latitude: latitude,
        longitude: longitude,
      });

      setFormData((prevData) => ({
        ...prevData,
        address: formattedAddress,
        country: componentMap.country,
        zipCode: componentMap.postal_code,
        city: componentMap.administrative_area_level_2,
        state: componentMap.administrative_area_level_1,
        latitude: latitude,
        longitude: longitude,
      }));
    };

    const handlePlaceChanged = (
      autocomplete: google.maps.places.Autocomplete
    ) => {
      if (!isLoaded) return;
      const place = autocomplete.getPlace();

      if (!place || !place.geometry) {
        setFormData((prevData) => ({
          ...prevData,
          address: "",
          country: "",
          zipCode: "",
          city: "",
          latitude: null,
          longitude: null,
        }));
        return;
      }

      updateAddressFormData(place);
    };

    const options = {
      componentRestrictions: { country: "uk" },
      fields: ["address_components", "geometry"],
    };

    const currentInputRef = inputRef.current;

    if (currentInputRef) {
      const autocomplete = new google.maps.places.Autocomplete(
        currentInputRef,
        options
      );
      autocomplete.addListener("place_changed", () =>
        handlePlaceChanged(autocomplete)
      );
    }

    return () => {
      if (currentInputRef) {
        google.maps.event.clearInstanceListeners(currentInputRef);
      }
    };
  }, [isLoaded, loadError]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Business Name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        name="address"
        placeholder="Business Address"
        type="text"
        ref={inputRef}
        value={formData.address}
        onChange={handleChange}
        required
      />
      <Input
        name="phoneNumber"
        placeholder="Business Phone Number"
        type="tel"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
      />
      <Textarea
        name="description"
        placeholder="Business Description"
        value={formData.description || ""}
        onChange={handleChange}
      />
      <Input
        name="hours"
        placeholder="Business Hours"
        type="text"
        value={formData.hours || ""}
        onChange={handleChange}
      />
      <Input
        name="email"
        placeholder="Business Email"
        type="email"
        value={formData.email || ""}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium mb-2">Business Photo</label>
        <Input
          name="photo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {(previewUrl || formData.photo) && (
          <div className="mt-2">
            <img
              src={previewUrl ?? formData.photo ?? ""}
              alt="Business photo preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <Select value={formData.type} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Business Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gym">Gym</SelectItem>
          <SelectItem value="gymAndClasses">Gym and Classes</SelectItem>
          <SelectItem value="classes">Classes</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit">Submit Business</Button>
    </form>
  );
};
