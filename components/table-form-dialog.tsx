"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateTable, useUpdateTable } from "@/hooks/use-table-mutations";

interface Table {
  id: number;
  name: string;
  status: "available" | "unavailable" | "reserved";
  createdAt: string;
  updatedAt: string;
}

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: Table | null;
  mode: "create" | "edit";
}

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "reserved", label: "Reserved" },
];

export function TableFormDialog({
  open,
  onOpenChange,
  table,
  mode,
}: TableFormDialogProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"available" | "unavailable" | "reserved">(
    "available"
  );

  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();

  const isLoading = createTableMutation.isPending || updateTableMutation.isPending;

  // Reset form when dialog opens/closes or table changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && table) {
        setName(table.name);
        setStatus(table.status);
      } else {
        setName("");
        setStatus("available");
      }
    }
  }, [open, mode, table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      if (mode === "create") {
        await createTableMutation.mutateAsync({
          name: name.trim(),
          status,
        });
      } else if (mode === "edit" && table) {
        await updateTableMutation.mutateAsync({
          id: table.id,
          data: {
            name: name.trim(),
            status,
          },
        });
      }

      onOpenChange(false);
    } catch {
      // Error handling is done in the mutation hooks
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Table" : "Edit Table"}
          </DialogTitle>
          <DialogClose onClose={handleClose} />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Table Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter table name (e.g., T1, Table 1)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              options={statusOptions}
              value={status}
              onValueChange={(value) =>
                setStatus(value as "available" | "unavailable" | "reserved")
              }
              placeholder="Select status"
              disabled={isLoading}
            />
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
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Table" : "Update Table"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
