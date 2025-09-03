"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  Receipt,
  UtensilsCrossed,
  Table,
  Calendar,
  LogOut,
  Menu,
  X,
  BookOpenText,
} from "lucide-react";
import { AuthService } from "@/lib/auth";
import { useRouter } from "next/navigation";

const dashboardCards = [
  {
    id: "sales",
    title: "Sales",
    description: "View sales reports",
    icon: DollarSign,
    count: "$2,450",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "expenses",
    title: "Expenses",
    description: "Track expenses",
    icon: Receipt,
    count: "$890",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "tables",
    title: "Tables",
    description: "Table management",
    icon: Table,
    count: "8",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "parties",
    title: "Parties",
    description: "Manage party bookings",
    icon: Calendar,
    count: "12",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "menu-items",
    title: "Menu Items",
    description: "Manage menu",
    icon: UtensilsCrossed,
    count: "45",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "users",
    title: "Users",
    description: "User management",
    icon: Users,
    count: "23",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "daybook",
    title: "Daybook",
    description: "Manage daily transactions",
    icon: BookOpenText,
    count: "45",
    color: "text-orange-600",
    bgColor: "bg-indigo-50",
  },
];

export default function Dashboard() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
  };

  const handleCardClick = (cardId: string) => {
    router.push(`/dashboard/${cardId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Business Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden"
            >
              {showMobileMenu ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Dashboard Content */}
      <main className="p-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your business operations
            </p>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {dashboardCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Card
                  key={card.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
                  onClick={() => handleCardClick(card.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${card.bgColor}`}>
                        <IconComponent className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <span className="text-lg font-bold text-foreground">
                        {card.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm mb-1">
                        {card.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
