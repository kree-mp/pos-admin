"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import useExpenseReports, { useExpenseReportsDateRange, TimePeriod } from "@/hooks/use-expense-reports";
import {
  DollarSign,
  ArrowLeft,
  Receipt,
  Truck,
  Utensils,
  Zap,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
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

export default function ExpenseReportsView() {
  const router = useRouter();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1day");
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 20;

  // Use period-based query by default
  const { 
    data: periodExpenseData, 
    isLoading: isPeriodLoading 
  } = useExpenseReports(selectedPeriod);

  // Use custom date range query when needed
  const { 
    data: customExpenseData, 
    isLoading: isCustomLoading 
  } = useExpenseReportsDateRange(
    customStartDate?.toISOString().split('T')[0],
    customEndDate?.toISOString().split('T')[0]
  );

  // Choose which data to use
  const expenseData = isCustomDateRange ? customExpenseData : periodExpenseData;
  const isLoading = isCustomDateRange ? isCustomLoading : isPeriodLoading;

  const { totalPages, currentPageData, expenseSummary, categoryBreakdown } = useMemo(() => {
    if (!expenseData) return { 
      totalPages: 0, 
      currentPageData: [], 
      expenseSummary: {
        totalExpenses: 0,
        totalTransactions: 0,
        avgExpenseValue: 0,
      },
      categoryBreakdown: {}
    };

    const total = Math.ceil(expenseData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = expenseData.slice(startIndex, endIndex);

    const summary = {
      totalExpenses: expenseData.reduce((sum, expense) => sum + expense.amount, 0),
      totalTransactions: expenseData.length,
      avgExpenseValue: expenseData.length > 0 ? 
        expenseData.reduce((sum, expense) => sum + expense.amount, 0) / expenseData.length : 0,
    };

    // Calculate category breakdown
    const breakdown = expenseData.reduce((acc, expense) => {
      const categoryName = expense.ExpenseCategory?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPages: total,
      currentPageData: paginatedData,
      expenseSummary: summary,
      categoryBreakdown: breakdown,
    };
  }, [expenseData, currentPage]);

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

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('inventory')) {
      return <Utensils className="w-4 h-4" />;
    }
    if (name.includes('util') || name.includes('electric') || name.includes('water')) {
      return <Zap className="w-4 h-4" />;
    }
    if (name.includes('equipment') || name.includes('maintenance')) {
      return <Package className="w-4 h-4" />;
    }
    if (name.includes('service') || name.includes('delivery')) {
      return <Truck className="w-4 h-4" />;
    }
    return <Receipt className="w-4 h-4" />;
  };

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('inventory')) {
      return "bg-orange-100 text-orange-800";
    }
    if (name.includes('util') || name.includes('electric') || name.includes('water')) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (name.includes('equipment') || name.includes('maintenance')) {
      return "bg-blue-100 text-blue-800";
    }
    if (name.includes('service') || name.includes('delivery')) {
      return "bg-purple-100 text-purple-800";
    }
    return "bg-gray-100 text-gray-800";
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
              Expense Reports
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your business expenses over time
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
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600">Total Expenses</span>
            </div>
            <p className="text-lg font-bold text-red-700">
              रु.{expenseSummary.totalExpenses.toFixed(2)}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Avg: रु.{expenseSummary.avgExpenseValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Transactions</span>
            </div>
            <p className="text-lg font-bold">{expenseSummary.totalTransactions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Categories: {Object.keys(categoryBreakdown).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryBreakdown).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="text-sm font-medium">{category}</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    रु.{amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Data */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">Expense Data</h3>
          <div className="flex items-center gap-4">
            {expenseData && expenseData.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {expenseData.length} expenses found
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
                No expenses found for the selected period
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentPageData.map((expense) => (
              <Card key={expense.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground">
                        {getCategoryIcon(expense.ExpenseCategory?.name || 'Uncategorized')}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {expense.description}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Vendor: {expense.Party?.name}</span>
                          </div>
                          {expense.PaymentMethod && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              <span>{expense.PaymentMethod.name}</span>
                            </div>
                          )}
                        </div>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">
                        रु.{expense.amount.toFixed(2)}
                      </p>
                      <Badge className={getCategoryColor(expense.ExpenseCategory?.name || 'Uncategorized')}>
                        {expense.ExpenseCategory?.name || 'Uncategorized'}
                      </Badge>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {expense.Party && (expense.Party.phone || expense.Party.address) && (
                    <div className="text-xs text-muted-foreground border-t pt-2 mb-2">
                      <div className="font-medium">Vendor Details:</div>
                      {expense.Party.phone && <div>Phone: {expense.Party.phone}</div>}
                      {expense.Party.address && (
                        <div>Address: {expense.Party.address}</div>
                      )}
                    </div>
                  )}

                  {/* Timestamp and Staff */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                    <span>Created: {formatDate(expense.createdAt)}</span>
                    <span>Staff: {expense.User?.username}</span>
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
                  {Math.min(currentPage * itemsPerPage, expenseData?.length || 0)}{" "}
                  of {expenseData?.length || 0}
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
