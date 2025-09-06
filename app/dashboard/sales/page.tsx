/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSales from "@/hooks/use-sales";
import useTables from "@/hooks/use-tables";
import useParties from "@/hooks/use-parties";
import { SalesUpdateSchema } from "@/schema/FormSchema";
import { getUserIdFromLocalStorage } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  ArrowLeft,
  Clock,
  User,
  MapPin,
  CreditCard,
  Receipt,
  ChevronLeft,
  ChevronRight,
  PencilLine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SalesView() {
  const router = useRouter();
  const { data: salesData, isLoading } = useSales();
  const { data: tablesData } = useTables();
  const { data: partiesData } = useParties();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditSalesForm, setShowEditSalesForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const itemsPerPage = 20;

  // Fetch payment methods on component mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const userId = getUserIdFromLocalStorage();
        const headers: Record<string, string> = userId ? { userId } : {};
        
        const response = await fetch(`${baseUrl}/payment-methods`, { headers });
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast.error("Error loading payment methods");
      }
    };

    fetchPaymentMethods();
  }, [baseUrl]);

  // Form state for sales update
  const [formData, setFormData] = useState({
    paymentStatus: "",
    orderStatus: "",
    paymentMethodId: "",
    orderType: "",
    tableId: "",
    partyId: "",
    subTotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: "",
  });

  // Handle opening edit form with sale data
  const handleEditSale = (sale: any) => {
    setSelectedSale(sale);
    setFormData({
      paymentStatus: sale.paymentStatus || "",
      orderStatus: sale.orderStatus || "",
      paymentMethodId: sale.paymentMethodId?.toString() || "",
      orderType: sale.orderType || "",
      tableId: sale.tableId?.toString() || "",
      partyId: sale.partyId?.toString() || "",
      subTotal: sale.subTotal || 0,
      discount: sale.discount || 0,
      tax: sale.tax || 0,
      total: sale.total || 0,
      notes: sale.notes || "",
    });
    setShowEditSalesForm(true);
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      // Validate form data
      const validatedData = SalesUpdateSchema.parse({
        ...formData,
        subTotal: Number(formData.subTotal),
        discount: Number(formData.discount),
        tax: Number(formData.tax),
        total: Number(formData.total),
      });

      console.log("Submitted form data:", validatedData);

      // Make API call to update sales
      const userId = getUserIdFromLocalStorage();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(userId ? { userId } : {}),
      };

      const response = await fetch(`${baseUrl}/sales/${selectedSale.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update sales record");
      }

      const result = await response.json();
      console.log("Update result:", result);

      toast.success("Sales record updated successfully!");
      setShowEditSalesForm(false);
      
      // You might want to refetch sales data here
      // refetch();
      
    } catch (error) {
      console.error("Error updating sales:", error);
      if (error instanceof Error) {
        toast.error(`Failed to update sales: ${error.message}`);
      } else {
        toast.error("Failed to update sales record");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const { filteredSales, totalPages, currentPageData } = useMemo(() => {
    if (!salesData || !selectedDate)
      return { filteredSales: [], totalPages: 0, currentPageData: [] };

    const selectedDateString = selectedDate.toISOString().split("T")[0];
    const filtered = salesData.filter((sale: any) => {
      const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];
      return saleDate === selectedDateString;
    });

    const total = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      filteredSales: filtered,
      totalPages: total,
      currentPageData: paginatedData,
    };
  }, [salesData, selectedDate, currentPage]);

  const salesSummary =
    filteredSales.length > 0
      ? {
          totalSales: filteredSales.reduce(
            (sum: number, sale: any) => sum + sale.total,
            0
          ),
          totalOrders: filteredSales.length,
          avgOrderValue:
            filteredSales.reduce(
              (sum: number, sale: any) => sum + sale.total,
              0
            ) / filteredSales.length,
          paidOrders: filteredSales.filter(
            (sale: any) => sale.paymentStatus === "paid"
          ).length,
          pendingOrders: filteredSales.filter(
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

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Sales Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your revenue and performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="date-filter"
              className="text-xs text-muted-foreground"
            >
              Date:
            </Label>
            <DatePicker
              date={selectedDate}
              onDateChange={handleDateChange}
              placeholder="Select date"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Total Sales</span>
            </div>
            <p className="text-lg font-bold">
              रु.{salesSummary.totalSales.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: रु.{salesSummary.avgOrderValue.toFixed(2)}
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">Recent Sales</h3>
          <div className="flex items-center gap-4">
            {filteredSales.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {filteredSales.length} orders on{" "}
                {selectedDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
            {totalPages > 1 && (
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>

        {currentPageData.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No sales found for{" "}
                {selectedDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }) || "selected date"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentPageData.map((sale: any) => (
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

                      <div
                        onClick={() => handleEditSale(sale)}
                        className="w-8 h-8 bg-gray-200 rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-300 transition-colors"
                      >
                        <PencilLine className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Financial Summary */}
                  <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
                    <span className="font-semibold text-lg">
                      रु.{sale.total.toFixed(2)}
                    </span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Subtotal: रु.{sale.subTotal.toFixed(2)}</div>
                      {sale.discount > 0 && (
                        <div className="text-red-600">
                          Discount: -रु.{sale.discount.toFixed(2)}
                        </div>
                      )}
                      {sale.tax > 0 && <div>Tax: रु.{sale.tax.toFixed(2)}</div>}
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
                            रु.{item.totalPrice.toFixed(2)}
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
                              रु.{payment.amount.toFixed(2)}
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
                          Balance: रु.{sale.Party.balance.toFixed(2)}
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
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Card className="mt-3">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredSales.length)}{" "}
                  of {filteredSales.length}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-7 px-2"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-7 h-7 p-0 text-xs"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showEditSalesForm} onOpenChange={setShowEditSalesForm}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Sales Record - {selectedSale?.invoiceNumber}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Payment Status */}
                <div>
                  <Label>Payment Status *</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Status */}
                <div>
                  <Label>Order Status *</Label>
                  <Select
                    value={formData.orderStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, orderStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select order status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="served">Served</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div>
                  <Label>Payment Method *</Label>
                  <Select
                    value={formData.paymentMethodId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethodId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Type */}
                <div>
                  <Label>Order Type *</Label>
                  <Select
                    value={formData.orderType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, orderType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Dine In</SelectItem>
                      <SelectItem value="takeaway">Takeaway</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div>
                  <Label>Table *</Label>
                  <Select
                    value={formData.tableId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tableId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tablesData?.map((table: any) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer */}
                <div>
                  <Label>Customer *</Label>
                  <Select
                    value={formData.partyId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, partyId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {partiesData?.map((party: any) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtotal */}
                <div>
                  <Label>Subtotal *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.subTotal}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        subTotal: parseFloat(e.target.value) || 0 
                      })
                    }
                    placeholder="Enter subtotal"
                  />
                </div>

                {/* Discount */}
                <div>
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        discount: parseFloat(e.target.value) || 0 
                      })
                    }
                    placeholder="Enter discount"
                  />
                </div>

                {/* Tax */}
                <div>
                  <Label>Tax</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        tax: parseFloat(e.target.value) || 0 
                      })
                    }
                    placeholder="Enter tax"
                  />
                </div>

                {/* Total */}
                <div>
                  <Label>Total *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        total: parseFloat(e.target.value) || 0 
                      })
                    }
                    placeholder="Enter total"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Enter any additional notes"
                />
              </div>

              {/* Current Sale Items Display */}
              {selectedSale?.SalesItems && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Current Items in Order:
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedSale.SalesItems.map((item: any, index: number) => (
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
                          रु.{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditSalesForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isFormLoading}
                >
                  {isFormLoading ? "Updating..." : "Update Sales"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
