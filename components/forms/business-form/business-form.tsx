"use client";

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
import { Business } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const BusinessForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Business>>({
    name: "",
    address: "",
    phoneNumber: "",
    description: "",
    hours: "",
    email: "",
    type: "",
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
      type: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Business added successfully");
        router.push("/businesses");
      } else {
        const errorData = await response.json();
        console.error("Failed to add business:", errorData.error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

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

      <Button type="submit">Submit</Button>
    </form>
  );
};

// FORM FIELDS NEEDED FROM THE PARTNER
// - Business Name
// - Business Address
// - Business Phone Number
// - Business Description
// - Business Hours
// - Business Email
// - Business type - (dropdown)

// - if business type is "gym", then:
//   - classes only
//   - gym floor only
//   - both classes and gym floor

// once the business type is defined e.g "gym" the partner can now select a button to add schedules for the gym
// when the button is clicked, a form will pop up and the partner can select different options for the schedule via a modal pop up
// - name of the class
// - price
// - description of the class
// - instructor of the class
// - duration of the class
// - capacity of the class, e.g. how many spaces are available for the class
// - calender selection to select the days of the week the class is available this should have the option to select the date e.g. a specific data or a repeated data or a range.
