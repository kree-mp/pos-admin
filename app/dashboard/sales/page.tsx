/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useSales from "@/hooks/use-sales";
import {
  DollarSign,
  ShoppingCart,
  ArrowLeft,
  Clock,
  User,
  MapPin,
  CreditCard,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SalesView() {
  const router = useRouter();
  const { data: salesData, isLoading } = useSales();

  const salesSummary = salesData
    ? {
        totalSales: salesData.reduce(
          (sum: number, sale: any) => sum + sale.total,
          0
        ),
        totalOrders: salesData.length,
        avgOrderValue:
          salesData.length > 0
            ? salesData.reduce(
                (sum: number, sale: any) => sum + sale.total,
                0
              ) / salesData.length
            : 0,
        paidOrders: salesData.filter(
          (sale: any) => sale.paymentStatus === "paid"
        ).length,
        pendingOrders: salesData.filter(
          (sale: any) => sale.paymentStatus === "pending"
        ).length,
      }
    : {
        totalSales: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        paidOrders: 0,
        pendingOrders: 0,
      };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "served":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <div
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block mb-4 cursor-pointer hover:bg-gray-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Sales Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Track your revenue and performance
        </p>
      </div>

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
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ${salesSummary.avgOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
            <p className="text-lg font-bold">{salesSummary.totalOrders}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-600">
                Paid: {salesSummary.paidOrders}
              </span>
              <span className="text-xs text-yellow-600">
                Pending: {salesSummary.pendingOrders}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-3">Recent Sales</h3>
        <div className="space-y-3">
          {salesData?.map((sale: any) => (
            <Card key={sale.id} className="border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-gray-600" />
                    <CardTitle className="text-sm font-medium">
                      {sale.invoiceNumber}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(sale.paymentStatus)}>
                      {sale.paymentStatus}
                    </Badge>
                    <Badge className={getStatusColor(sale.orderStatus)}>
                      {sale.orderStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Financial Summary */}
                <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-lg">
                    ${sale.total.toFixed(2)}
                  </span>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Subtotal: ${sale.subTotal.toFixed(2)}</div>
                    {sale.discount > 0 && (
                      <div className="text-red-600">
                        Discount: -${sale.discount.toFixed(2)}
                      </div>
                    )}
                    {sale.tax > 0 && <div>Tax: ${sale.tax.toFixed(2)}</div>}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-muted-foreground">Table:</span>
                      <span className="font-medium">{sale.Table?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">{sale.Party?.name}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-gray-500" />
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-medium">
                        {sale.PaymentMethod?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{sale.orderType}</span>
                    </div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Items Ordered:</h4>
                  <div className="space-y-1">
                    {sale.SalesItems?.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                      >
                        <div>
                          <span className="font-medium">{item.itemName}</span>
                          <span className="text-muted-foreground ml-2">
                            x{item.quantity}
                          </span>
                          {item.notes && (
                            <div className="text-xs text-muted-foreground italic">
                              {item.notes}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                {sale.Payments && sale.Payments.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-2">Payments:</h4>
                    <div className="space-y-1">
                      {sale.Payments.map((payment: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm bg-green-50 p-2 rounded"
                        >
                          <span>{payment.PaymentMethod?.name}</span>
                          <span className="font-medium text-green-700">
                            ${payment.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                {sale.Party && (sale.Party.phone || sale.Party.address) && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="font-medium">Customer Details:</div>
                    {sale.Party.phone && <div>Phone: {sale.Party.phone}</div>}
                    {sale.Party.address && (
                      <div>Address: {sale.Party.address}</div>
                    )}
                    {sale.Party.balance > 0 && (
                      <div className="text-blue-600">
                        Balance: ${sale.Party.balance.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 pt-2 border-t">
                  <span>Created: {formatDate(sale.createdAt)}</span>
                  <span>Staff: {sale.User?.username}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
