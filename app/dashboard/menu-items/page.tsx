"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Star,
  DollarSign,
  ArrowLeft,
  Search,
  Edit3,
  Loader2,
  UtensilsCrossed,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useMenu from "@/hooks/use-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import AddItem from "./add-item";
import AddCategory from "./add-category";
import { toast } from "sonner";
import axios from "axios";

interface MenuItem {
  id: number;
  categoryId: number;
  itemName: string;
  description: string | null;
  rate: number;
  image: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  MenuCategory: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default function MenuItemsPage() {
  const router = useRouter();
  const { data: menuData, isLoading, error, refetch } = useMenu();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    itemName: "",
    description: "",
    rate: 0,
    categoryId: 0,
    isAvailable: true,
  });

  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const allItems =
    menuData?.flatMap((categoryData) => categoryData.category.items || []) ||
    [];

  const allCategories =
    menuData?.map((categoryData) => categoryData.category) || [];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.MenuCategory?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setEditFormData({
      itemName: item.itemName,
      description: item.description || "",
      rate: item.rate,
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (item: MenuItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !baseUrl) return;

    setIsSubmitting(true);
    try {
      await axios.put(`${baseUrl}/menu/items/${selectedItem.id}`, editFormData);
      toast.success("Menu item updated successfully");
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      refetch();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !baseUrl) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`${baseUrl}/menu/items/${itemToDelete.id}`);
      toast.success("Menu item deleted successfully");
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedItem(null);
    setEditFormData({
      itemName: "",
      description: "",
      rate: 0,
      categoryId: 0,
      isAvailable: true,
    });
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      main: "bg-blue-100 text-blue-800",
      appetizer: "bg-green-100 text-green-800",
      dessert: "bg-pink-100 text-pink-800",
      beverage: "bg-purple-100 text-purple-800",
      starter: "bg-yellow-100 text-yellow-800",
      snacks: "bg-orange-100 text-orange-800",
    };

    return colorMap[categoryName.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="space-y-4 p-4">
        <div
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading menu items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <div
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block mb-4 cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Menu Items
          </h2>
          <Button onClick={() => setShowNewItemForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Manage your restaurant menu
          </p>

          <Button
            variant="outline"
            onClick={() => setShowAddCategoryForm(true)}
            className="ml-2 bg-gray-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search menu items, categories, or descriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Category Filter - Horizontal Scrollable */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className="whitespace-nowrap flex-shrink-0"
          >
            All
          </Button>
          {allCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap flex-shrink-0"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                <p className="text-2xl font-bold text-blue-700">
                  {filteredItems.length}
                </p>
              </div>
              <p className="text-sm text-blue-600">
                {selectedCategory === "all" ? "Total Items" : "Filtered Items"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-5 h-5 text-green-600" />
                <p className="text-2xl font-bold text-green-700">
                  {filteredItems.filter((item) => item.isAvailable).length}
                </p>
              </div>
              <p className="text-sm text-green-600">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-purple-600" />
                <p className="text-2xl font-bold text-purple-700">
                  {allCategories.length}
                </p>
              </div>
              <p className="text-sm text-purple-600">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`border ${
                item.isAvailable ? "border-border" : "border-red-200 bg-red-50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base">
                        {item.itemName}
                      </h4>
                      {!item.isAvailable && (
                        <Badge variant="destructive" className="text-xs">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.description || "No description available"}
                    </p>

                    {/* Item Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(item.rate)}
                          </span>
                        </div>
                        {item.MenuCategory && (
                          <Badge
                            className={getCategoryColor(item.MenuCategory.name)}
                          >
                            {item.MenuCategory.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ID: #{item.id}</span>
                    <span>
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            No menu items found
          </p>
          <p className="text-muted-foreground text-sm">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search criteria or category filter"
              : "Menu items will appear here when they are added"}
          </p>
        </div>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Menu Item
            </DialogTitle>
            <DialogDescription>
              Make changes to the menu item details
            </DialogDescription>
            <DialogClose onClose={handleCloseDialog} />
          </DialogHeader>

          <div className="p-6 pt-2 space-y-4">
            <div>
              <Label htmlFor="itemName" className="text-sm font-medium">
                Item Name
              </Label>
              <Input
                id="itemName"
                type="text"
                value={editFormData.itemName}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    itemName: e.target.value,
                  }))
                }
                placeholder="Enter item name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                type="text"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter item description"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rate" className="text-sm font-medium">
                Price
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={editFormData.rate}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    rate: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter item price"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={editFormData.isAvailable}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isAvailable: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="isAvailable" className="text-sm font-medium">
                Available for sale
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="bg-primary"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Menu Item
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{itemToDelete?.itemName}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pt-2">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Delete Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewItemForm} onOpenChange={setShowNewItemForm}>
        <DialogContent className="max-w-xl">
          <AddItem onClose={() => setShowNewItemForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCategoryForm} onOpenChange={setShowAddCategoryForm}>
        <DialogContent className="max-w-xl">
          <AddCategory onClose={() => setShowAddCategoryForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
