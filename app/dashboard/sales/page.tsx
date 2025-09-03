"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

const mockSalesData = [
  {
    id: 1,
    date: "2024-01-15",
    amount: 450.0,
    items: 12,
    type: "Dine-in",
    trend: "up",
  },
  {
    id: 2,
    date: "2024-01-14",
    amount: 320.5,
    items: 8,
    type: "Takeout",
    trend: "down",
  },
  {
    id: 3,
    date: "2024-01-13",
    amount: 680.75,
    items: 18,
    type: "Dine-in",
    trend: "up",
  },
  {
    id: 4,
    date: "2024-01-12",
    amount: 290.25,
    items: 6,
    type: "Delivery",
    trend: "up",
  },
];

const salesSummary = {
  totalSales: 2450.0,
  totalOrders: 68,
  avgOrderValue: 36.03,
  topSellingDay: "Saturday",
};

export default function SalesView() {
  const router = useRouter();
  return (
    <div className="space-y-4 p-6">
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
          Sales Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Track your revenue and performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Total Sales</span>
            </div>
            <p className="text-lg font-bold">
              ${salesSummary.totalSales.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">
                Total Orders
              </span>
            </div>
            <p className="text-lg font-bold">{salesSummary.totalOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Recent Sales</h3>
        <div className="space-y-3">
          {mockSalesData.map((sale) => (
            <Card key={sale.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">${sale.amount.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    {sale.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {sale.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{sale.date}</span>
                  <span>{sale.items} items</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
