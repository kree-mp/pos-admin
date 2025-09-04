"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useTables from "@/hooks/use-tables";
import { TableFormDialog } from "@/components/table-form-dialog";
import { DeleteTableDialog } from "@/components/delete-table-dialog";

interface Table {
  id: number;
  name: string;
  status: "available" | "unavailable" | "reserved";
  createdAt: string;
  updatedAt: string;
}

export default function TablesPage() {
  const router = useRouter();
  const { data: tables, isLoading, error } = useTables();
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTableClick = (tableId: number) => {
    router.push(`/dashboard/tables/${tableId}`);
  };

  const handleEditTable = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTable = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !tables) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading tables</p>
      </div>
    );
  }

  const availableTables = tables.filter(
    (table) => table.status === "available"
  ).length;
  const unavailableTables = tables.filter(
    (table) => table.status === "unavailable"
  ).length;
  const reservedTables = tables.filter(
    (table) => table.status === "reserved"
  ).length;

  return (
    <div className="space-y-4 p-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            onClick={() => {
              router.back();
            }}
            className="px-3 py-2 bg-gray-300 rounded-md inline-block cursor-pointer"
          >
            <ArrowLeft className="text-3xl" />
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Table
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Table Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor table status and availability
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">
                {availableTables}
              </p>
              <p className="text-sm text-green-600">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">
                {unavailableTables}
              </p>
              <p className="text-sm text-red-600">Unavailable</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {reservedTables}
              </p>
              <p className="text-sm text-yellow-600">Reserved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {tables.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {tables.map((table) => (
            <Card
              key={table.id}
              className="border border-border cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95 relative"
              onClick={() => handleTableClick(table.id)}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="w-auto h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">
                      {table.name}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base text-foreground">
                      Table {table.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(table.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge
                    className={`${getStatusColor(table.status)} px-3 py-1`}
                  >
                    {table.status.charAt(0).toUpperCase() +
                      table.status.slice(1)}
                  </Badge>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        Updated:{" "}
                        {new Date(table.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {table.status === "unavailable" && (
                      <p className="text-xs text-red-600 mt-1 font-medium mb-2">
                        Currently Unavailable
                      </p>
                    )}

                    {table.status === "reserved" && (
                      <p className="text-xs text-yellow-600 mt-1 font-medium mb-2">
                        Reserved
                      </p>
                    )}

                    {table.status === "available" && (
                      <p className="text-xs text-green-600 mt-1 font-medium mb-2">
                        Ready for Service
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleEditTable(table, e)}
                        className="flex-1 h-8 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDeleteTable(table, e)}
                        className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            No tables found
          </p>
          <p className="text-muted-foreground text-sm">
            Tables will appear here when they are created
          </p>
        </div>
      )}

      {/* Dialog components */}
      <TableFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />

      <TableFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        table={selectedTable}
      />

      <DeleteTableDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        table={selectedTable}
      />
    </div>
  );
}
