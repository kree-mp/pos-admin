"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserFormSchema } from "@/schema/FormSchema";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseUrl) throw new Error("BASE_URL is not defined");

import type { User } from "@/types/api-response";

interface AddUserFormProps {
  onClose: () => void;
  user?: User;
  onSubmit?: (data: { username: string; role: string }) => Promise<void>;
}

export function AddUserForm({ onClose, user, onSubmit }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    role: user?.role || "waiter",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await UserFormSchema.safeParseAsync(formData);
      if (user && onSubmit) {
        // Edit mode
        await onSubmit(formData);
        toast.success("User updated successfully");
      } else {
        // Create mode
        const response = await fetch(`${baseUrl}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const body = await response.json();
        if (!response.ok) {
          toast.error(body.message || "Something went wrong");
          setIsLoading(false);
          return;
        }
        toast.success("User created successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid input data");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user ? "Edit User" : "Add New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Role</Label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-[180px] border rounded px-2 py-1"
              required
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="waiter">Waiter</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (user ? "Updating..." : "Creating...") : user ? "Update User" : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
