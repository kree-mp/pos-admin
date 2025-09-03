"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


const mockTables = [
  {
    id: 1,
    number: "T-01",
    capacity: 4,
    status: "occupied",
    currentGuests: 3,
    timeOccupied: "45 min",
    location: "Main Floor",
  },
  {
    id: 2,
    number: "T-02",
    capacity: 2,
    status: "available",
    currentGuests: 0,
    timeOccupied: null,
    location: "Main Floor",
  },
  {
    id: 3,
    number: "T-03",
    capacity: 6,
    status: "reserved",
    currentGuests: 0,
    timeOccupied: null,
    location: "Main Floor",
  },
  {
    id: 4,
    number: "T-04",
    capacity: 8,
    status: "occupied",
    currentGuests: 6,
    timeOccupied: "1h 20min",
    location: "Private Room",
  },
  {
    id: 5,
    number: "T-05",
    capacity: 4,
    status: "cleaning",
    currentGuests: 0,
    timeOccupied: null,
    location: "Main Floor",
  },
];

export function TablesView() {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "cleaning":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const availableTables = mockTables.filter(
    (table) => table.status === "available"
  ).length;
  const occupiedTables = mockTables.filter(
    (table) => table.status === "occupied"
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <div
          onClick={() => {
            router.back();
          }}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block mb-4 cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Table Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor table status and availability
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
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
                {occupiedTables}
              </p>
              <p className="text-sm text-red-600">Occupied</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables List */}
      <div className="space-y-3">
        {mockTables.map((table) => (
          <Card key={table.id} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {table.number}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{table.location}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>Seats {table.capacity}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(table.status)}>
                  {table.status}
                </Badge>
              </div>

              {table.status === "occupied" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {table.currentGuests} of {table.capacity} guests
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{table.timeOccupied}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
