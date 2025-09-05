"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MenuCategoryFormSchema } from "@/schema/FormSchema";
import React, { useState } from "react";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) throw new Error("BASE_URL is not defined");

const AddCategory = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      MenuCategoryFormSchema.safeParse(formData);

      const res = await fetch(`${baseUrl}/menu/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setFormData({ name: "" });

      onClose();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Menu Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div>
            <Label>Category Name *</Label>
            <Input
              type="text"
              placeholder="Enter category name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-2 mb-4"
            />
          </div>

          <Button disabled={loading} type="submit">
            {loading ? "Adding..." : "Add Category"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCategory;
