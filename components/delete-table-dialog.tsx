"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useDeleteTable } from "@/hooks/use-table-mutations";

interface Table {
  id: number;
  name: string;
  status: "available" | "unavailable" | "reserved";
  createdAt: string;
  updatedAt: string;
}

interface DeleteTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
}

export function DeleteTableDialog({
  open,
  onOpenChange,
  table,
}: DeleteTableDialogProps) {
  const deleteTableMutation = useDeleteTable();

  const isLoading = deleteTableMutation.isPending;

  const handleDelete = async () => {
    if (!table) return;

    try {
      await deleteTableMutation.mutateAsync(table.id);
      onOpenChange(false);
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Table
          </DialogTitle>
          <DialogClose onClose={handleClose} />
        </DialogHeader>

        <div className="p-6 pt-2">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete this table?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">Table: {table.name}</p>
              <p className="text-sm text-gray-600">
                Status: {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
              </p>
            </div>
            <p className="text-sm text-red-600 mt-3 font-medium">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Table
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
