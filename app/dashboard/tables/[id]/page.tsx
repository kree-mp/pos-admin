"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, ShoppingCart, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import useCart from "@/hooks/use-cart";
import { Cart, CartItem } from "@/types/api-response";

export default function TableDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = parseInt(params.id as string);

  const { data: cartData, isLoading, error } = useCart(tableId);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !cartData) {
    return (
      <div className="space-y-4">
        <div
          onClick={handleBack}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">
            Error loading table data or no orders found
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const calculateCartTotal = (cart: Cart) => {
    return cart.CartItems.reduce(
      (sum: number, item: CartItem) => sum + item.totalPrice,
      0
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <div
          onClick={handleBack}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block mb-4 cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Table {tableId} - Orders
        </h2>
        <p className="text-sm text-muted-foreground">
          View all orders for this table
        </p>
      </div>

      {/* Orders Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">
                {cartData.length}
              </p>
              <p className="text-sm text-blue-600">Total Orders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(
                  cartData.reduce(
                    (sum, cart) => sum + calculateCartTotal(cart),
                    0
                  )
                )}
              </p>
              <p className="text-sm text-green-600">Total Amount</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {cartData.map((cart) => (
          <Card key={cart.id} className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Order #{cart.id}
                </CardTitle>
                <Badge className={getStatusColor(cart.status)}>
                  {cart.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(cart.createdAt).toLocaleDateString()}{" "}
                    {new Date(cart.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {cart.User && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{cart.User.username}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Cart Items */}
              <div className="space-y-2 mb-4">
                {cart.CartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {item.MenuItem?.itemName || item.Item?.itemName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.MenuItem?.description || item.Item?.description}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-blue-600 italic">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.quantity} × {formatCurrency(item.rate)}
                      </p>
                      <p className="text-xs font-semibold text-primary">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-medium">Order Total:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(calculateCartTotal(cart))}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cartData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No orders found for this table
          </p>
        </div>
      )}
    </div>
  );
}
