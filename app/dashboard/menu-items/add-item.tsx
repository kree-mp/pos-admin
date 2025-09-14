"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useMenu from "@/hooks/use-menu";
import { MenuItemFormSchema } from "@/schema/FormSchema";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) throw new Error("BASE_URL is not defined");

const AddItem = ({ onClose }: { onClose: () => void }) => {
  const { data: MenuCategories } = useMenu();

  console.log("MenuCategories:", MenuCategories);

  const [formData, setFormData] = useState({
    categoryId: "",
    itemName: "",
    description: "",
    rate: "",
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      MenuItemFormSchema.safeParse(formData);

      const res = await fetch(`${baseUrl}/menu/items`, {
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

      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setFormData({
        categoryId: "",
        itemName: "",
        description: "",
        rate: "",
        isAvailable: true,
      });

      onClose();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Menu Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div>
            <Label>Category *</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, categoryId: value })} value={formData.categoryId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {MenuCategories && MenuCategories.length > 0 ? (
                  MenuCategories.map((category) => (
                    <SelectItem
                      value={category.category.id.toString()}
                      key={category.category.id}
                    >
                      {category.category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    No categories
                  </SelectItem>
                )}
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Item Name *</Label>
            <Input
              type="text"
              placeholder="Enter item name"
              required
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
              className="mt-2 mb-4"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              type="text"
              placeholder="Enter item description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-2 mb-4"
            />
          </div>

          <div>
            <Label>Rate *</Label>
            <Input
              type="number"
              placeholder="Enter item rate"
              required
              value={formData.rate}
              onChange={(e) =>
                setFormData({ ...formData, rate: e.target.value })
              }
              className="mt-2 mb-4"
            />
          </div>

          <div>
            <Label>Available *</Label>
            <Switch
              checked={formData.isAvailable}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isAvailable: checked })
              }
            />
          </div>

          <Button disabled={loading} type="submit">
            {loading ? "Adding..." : "Add Items"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddItem;
