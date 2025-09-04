"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import useSalesReports, { useSalesReportsDateRange, TimePeriod } from "@/hooks/use-sales-reports";
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
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "1day", label: "Today" },
  { value: "3days", label: "3 Days" },
  { value: "7days", label: "7 Days" },
  { value: "1month", label: "1 Month" },
  { value: "6months", label: "6 Months" },
];

export default function SalesReportsView() {
  const router = useRouter();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1day");
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 20;

  // Use period-based query by default
  const { 
    data: periodSalesData, 
    isLoading: isPeriodLoading 
  } = useSalesReports(selectedPeriod);

  // Use custom date range query when needed
  const { 
    data: customSalesData, 
    isLoading: isCustomLoading 
  } = useSalesReportsDateRange(
    customStartDate?.toISOString().split('T')[0],
    customEndDate?.toISOString().split('T')[0]
  );

  // Choose which data to use
  const salesData = isCustomDateRange ? customSalesData : periodSalesData;
  const isLoading = isCustomDateRange ? isCustomLoading : isPeriodLoading;

  const { totalPages, currentPageData, salesSummary } = useMemo(() => {
    if (!salesData) return { 
      totalPages: 0, 
      currentPageData: [], 
      salesSummary: {
        totalSales: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        paidOrders: 0,
        pendingOrders: 0,
      }
    };

    const total = Math.ceil(salesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = salesData.slice(startIndex, endIndex);

    const summary = {
      totalSales: salesData.reduce((sum, sale) => sum + sale.total, 0),
      totalOrders: salesData.length,
      avgOrderValue: salesData.length > 0 ? 
        salesData.reduce((sum, sale) => sum + sale.total, 0) / salesData.length : 0,
      paidOrders: salesData.filter(sale => sale.paymentStatus === "paid").length,
      pendingOrders: salesData.filter(sale => sale.paymentStatus === "pending").length,
    };

    return {
      totalPages: total,
      currentPageData: paginatedData,
      salesSummary: summary,
    };
  }, [salesData, currentPage]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setIsCustomDateRange(false);
    setCurrentPage(1);
  };

  const handleCustomDateRangeToggle = () => {
    setIsCustomDateRange(!isCustomDateRange);
    setCurrentPage(1);
  };

  const handleCustomDateChange = (startDate?: Date, endDate?: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
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
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "served":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-indigo-100 text-indigo-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
              Sales Reports
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your revenue and performance over time
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Time Period Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs text-muted-foreground">Period:</Label>
            {TIME_PERIODS.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value && !isCustomDateRange ? "default" : "outline"}
                size="sm"
                onClick={() => handlePeriodChange(period.value)}
                className="h-8 px-3"
              >
                {period.label}
              </Button>
            ))}
            <Button
              variant={isCustomDateRange ? "default" : "outline"}
              size="sm"
              onClick={handleCustomDateRangeToggle}
              className="h-8 px-3"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Custom
            </Button>
          </div>

          {/* Custom Date Range */}
          {isCustomDateRange && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">From:</Label>
                <DatePicker
                  date={customStartDate}
                  onDateChange={(date) => handleCustomDateChange(date, customEndDate)}
                  placeholder="Start date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">To:</Label>
                <DatePicker
                  date={customEndDate}
                  onDateChange={(date) => handleCustomDateChange(customStartDate, date)}
                  placeholder="End date"
                />
              </div>
            </div>
          )}
        </div>
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

      {/* Sales Data */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">Sales Data</h3>
          <div className="flex items-center gap-4">
            {salesData && salesData.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {salesData.length} orders found
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
                No sales found for the selected period
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentPageData.map((sale) => (
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
                      {sale.SalesItems?.map((item, index) => (
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
                        {sale.Payments.map((payment, index) => (
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
                  {Math.min(currentPage * itemsPerPage, salesData?.length || 0)}{" "}
                  of {salesData?.length || 0}
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
      </div>
    </div>
  );
}
