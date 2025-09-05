"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartyFormSchema } from "@/schema/FormSchema";
import React, { useState } from "react";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const AddParty = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    openingBalance: "0",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await PartyFormSchema.safeParseAsync(formData);

      const response = await fetch(`${baseUrl}/parties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to add party:", data);
        throw new Error("Failed to add party");
      }

      toast.success("Party added successfully!");
      console.log("Party added:", data);
    } catch (error) {
      console.error("Error adding party:", error);
      toast.error("Failed to add party. Please try again.");
    } finally {
      setFormData({
        type: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        openingBalance: "",
      });

      setIsLoading(false);

      onClose();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add new party</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Party Type *</Label>
            <Select
              required
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Party type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Party name *</Label>
            <Input
              type="text"
              placeholder="Enter party name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Phone *</Label>
            <Input
              type="text"
              placeholder="Enter phone number"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Address *</Label>
            <Input
              type="text"
              placeholder="Enter address"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Opening Balance</Label>
            <Input
              type="text"
              placeholder="Enter opening balance"
              value={formData.openingBalance}
              onChange={(e) =>
                setFormData({ ...formData, openingBalance: e.target.value })
              }
            />
          </div>

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? "Adding..." : "Add Party"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddParty;
