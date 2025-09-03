"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, MapPin, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


const mockParties = [
  {
    id: 1,
    name: "Birthday Celebration",
    date: "2024-01-15",
    time: "7:00 PM",
    guests: 12,
    status: "confirmed",
    location: "Table 5-6",
    contact: "John Smith",
  },
  {
    id: 2,
    name: "Anniversary Dinner",
    date: "2024-01-18",
    time: "6:30 PM",
    guests: 8,
    status: "pending",
    location: "Private Room",
    contact: "Sarah Johnson",
  },
  {
    id: 3,
    name: "Corporate Event",
    date: "2024-01-20",
    time: "12:00 PM",
    guests: 25,
    status: "confirmed",
    location: "Main Hall",
    contact: "Mike Wilson",
  },
  {
    id: 4,
    name: "Wedding Reception",
    date: "2024-01-22",
    time: "5:00 PM",
    guests: 50,
    status: "confirmed",
    location: "Garden Area",
    contact: "Emma Davis",
  },
];

export function PartiesView() {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          Party Bookings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage upcoming party reservations
        </p>
      </div>

      <div className="space-y-3">
        {mockParties.map((party) => (
          <Card key={party.id} className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-medium">
                  {party.name}
                </CardTitle>
                <Badge className={getStatusColor(party.status)}>
                  {party.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{party.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{party.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{party.guests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{party.location}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Contact: <span className="font-medium">{party.contact}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
