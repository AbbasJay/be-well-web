"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Business } from "@/lib/db/schema";

interface BusinessFormProps {
  onSubmit?: (data: Business) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Business>({
    name: "",
    address: "",
    phoneNumber: "",
    description: "",
    hours: "",
    email: "",
    type: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Business added successfully');
        onSubmit && onSubmit(formData);
      } else {
        const errorData = await response.json();
        console.error('Failed to add business:', errorData.error);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" placeholder="Business Name" type="text" value={formData.name} onChange={handleChange} />
      <Input name="address" placeholder="Business Address" type="text" value={formData.address} onChange={handleChange} />
      <Input name="phoneNumber" placeholder="Business Phone Number" type="text" value={formData.phoneNumber} onChange={handleChange} />
      <Input name="description" placeholder="Business Description" type="text" value={formData.description || ""} onChange={handleChange} />
      <Input name="hours" placeholder="Business Hours" type="text" value={formData.hours || ""} onChange={handleChange} />
      <Input name="email" placeholder="Business Email" type="text" value={formData.email || ""} onChange={handleChange} />

      <Select value={formData.type} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Business Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gym">Gym</SelectItem>
          <SelectItem value="gymAndClasses">Gym and Classes</SelectItem>
          <SelectItem value="classes">Classes</SelectItem>
        </SelectContent>
      </Select>

      <button type="submit">Submit</button>
    </form>
  );
};
