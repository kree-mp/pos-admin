"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import useExpenseReports, {
  useExpenseReportsDateRange,
  TimePeriod,
} from "@/hooks/use-expense-reports";
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
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "1day", label: "Today" },
  { value: "3days", label: "3 Days" },
  { value: "7days", label: "7 Days" },
  { value: "1month", label: "1 Month" },
  { value: "6months", label: "6 Months" },
];

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseUrl) throw new Error("API Base URL is not defined");

interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface ExpenseFormData {
  title: string;
  description: string;
  amount: string;
  paymentMethodId: number;
  categoryId: number;
  date: Date;
  referenceNo: string;
}

interface NewCategoryData {
  name: string;
  description: string;
}

export default function ExpenseReportsView() {
  const router = useRouter();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1day");
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    title: "",
    description: "",
    amount: "",
    paymentMethodId: 0,
    categoryId: 0,
    date: new Date(),
    referenceNo: "",
  });
  const [newCategory, setNewCategory] = useState<NewCategoryData>({
    name: "",
    description: "",
  });

  const itemsPerPage = 20;

  const fetchCategoriesAndPaymentMethods = async () => {
    try {
      const userId = getUserIdFromLocalStorage();
      const headers: Record<string, string> = userId ? { userId } : {};

      const [categoriesResponse, paymentMethodsResponse] = await Promise.all([
        fetch(`${baseUrl}/expense-categories`, { headers }),
        fetch(`${baseUrl}/payment-methods`, { headers }),
      ]);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data || []);
      }

      if (paymentMethodsResponse.ok) {
        const paymentMethodsData = await paymentMethodsResponse.json();
        setPaymentMethods(paymentMethodsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast("Error loading form data");
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if categoryId and paymentMethodId are valid (not 0)
    if (
      !expenseForm.title ||
      !expenseForm.description ||
      !expenseForm.amount ||
      expenseForm.categoryId === 0 ||
      expenseForm.paymentMethodId === 0
    ) {
      toast("Please fill in all required fields");
      return;
    }

    const userId = getUserIdFromLocalStorage();
    if (!userId) {
      toast("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        title: expenseForm.title,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paymentMethodId: expenseForm.paymentMethodId,
        categoryId: expenseForm.categoryId,
        date: expenseForm.date.toISOString().split("T")[0],
        referenceNo: expenseForm.referenceNo || null,
        createdBy: parseInt(userId),
      };

      const response = await fetch(`${baseUrl}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Expense added successfully");
        setIsExpenseDialogOpen(false);
        setExpenseForm({
          title: "",
          description: "",
          amount: "",
          paymentMethodId: 0,
          categoryId: 0,
          date: new Date(),
          referenceNo: "",
        });

        window.location.reload();
      } else {
        const errorData = await response.json();

        toast(errorData.message || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.name) {
      toast("Category name is required");
      return;
    }

    const userId = getUserIdFromLocalStorage();
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/expense-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId,
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        toast("Category added successfully");
        setIsCategoryDialogOpen(false);
        setNewCategory({ name: "", description: "" });

        const newCat = result.data;
        setCategories((prev) => [...prev, newCat]);
        setExpenseForm((prev) => ({ ...prev, categoryId: newCat.id }));
      } else {
        const errorData = await response.json();

        toast(errorData.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast("Failed to add category");
    }
  };

  const openExpenseDialog = () => {
    setIsExpenseDialogOpen(true);
    fetchCategoriesAndPaymentMethods();
  };

  const { data: periodExpenseData, isLoading: isPeriodLoading } =
    useExpenseReports(selectedPeriod);

  const { data: customExpenseData, isLoading: isCustomLoading } =
    useExpenseReportsDateRange(
      customStartDate?.toISOString().split("T")[0],
      customEndDate?.toISOString().split("T")[0]
    );

  const expenseData = isCustomDateRange ? customExpenseData : periodExpenseData;
  const isLoading = isCustomDateRange ? isCustomLoading : isPeriodLoading;

  const { totalPages, currentPageData, expenseSummary, categoryBreakdown } =
    useMemo(() => {
      if (!expenseData)
        return {
          totalPages: 0,
          currentPageData: [],
          expenseSummary: {
            totalExpenses: 0,
            totalTransactions: 0,
            avgExpenseValue: 0,
          },
          categoryBreakdown: {},
        };

      const total = Math.ceil(expenseData.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = expenseData.slice(startIndex, endIndex);

      const summary = {
        totalExpenses: expenseData.reduce(
          (sum, expense) => sum + expense.amount,
          0
        ),
        totalTransactions: expenseData.length,
        avgExpenseValue:
          expenseData.length > 0
            ? expenseData.reduce((sum, expense) => sum + expense.amount, 0) /
              expenseData.length
            : 0,
      };

      const breakdown = expenseData.reduce((acc, expense) => {
        const categoryName = expense.ExpenseCategory?.name || "Uncategorized";
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
    if (name.includes("food") || name.includes("inventory")) {
      return <Utensils className="w-4 h-4" />;
    }
    if (
      name.includes("util") ||
      name.includes("electric") ||
      name.includes("water")
    ) {
      return <Zap className="w-4 h-4" />;
    }
    if (name.includes("equipment") || name.includes("maintenance")) {
      return <Package className="w-4 h-4" />;
    }
    if (name.includes("service") || name.includes("delivery")) {
      return <Truck className="w-4 h-4" />;
    }
    return <Receipt className="w-4 h-4" />;
  };

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("food") || name.includes("inventory")) {
      return "bg-orange-100 text-orange-800";
    }
    if (
      name.includes("util") ||
      name.includes("electric") ||
      name.includes("water")
    ) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (name.includes("equipment") || name.includes("maintenance")) {
      return "bg-blue-100 text-blue-800";
    }
    if (name.includes("service") || name.includes("delivery")) {
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
          <Button
            onClick={openExpenseDialog}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Time Period Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs text-muted-foreground">Period:</Label>
            {TIME_PERIODS.map((period) => (
              <Button
                key={period.value}
                variant={
                  selectedPeriod === period.value && !isCustomDateRange
                    ? "default"
                    : "outline"
                }
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
                  onDateChange={(date) =>
                    handleCustomDateChange(date, customEndDate)
                  }
                  placeholder="Start date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">To:</Label>
                <DatePicker
                  date={customEndDate}
                  onDateChange={(date) =>
                    handleCustomDateChange(customStartDate, date)
                  }
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
              <span className="text-xs text-muted-foreground">
                Transactions
              </span>
            </div>
            <p className="text-lg font-bold">
              {expenseSummary.totalTransactions}
            </p>
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
                <div
                  key={category}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
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
                        {getCategoryIcon(
                          expense.ExpenseCategory?.name || "Uncategorized"
                        )}
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
                      <Badge
                        className={getCategoryColor(
                          expense.ExpenseCategory?.name || "Uncategorized"
                        )}
                      >
                        {expense.ExpenseCategory?.name || "Uncategorized"}
                      </Badge>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {expense.Party &&
                    (expense.Party.phone || expense.Party.address) && (
                      <div className="text-xs text-muted-foreground border-t pt-2 mb-2">
                        <div className="font-medium">Vendor Details:</div>
                        {expense.Party.phone && (
                          <div>Phone: {expense.Party.phone}</div>
                        )}
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
                  {Math.min(
                    currentPage * itemsPerPage,
                    expenseData?.length || 0
                  )}{" "}
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

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogClose onClose={() => setIsExpenseDialogOpen(false)} />
          </DialogHeader>

          <form onSubmit={handleExpenseSubmit} className="p-6 pt-0 space-y-4">
            <div>
              <Label className="text-sm font-medium">Title *</Label>
              <Input
                type="text"
                value={expenseForm.title}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter expense title"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Description *</Label>
              <Input
                type="text"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter expense description"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="0.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Payment Method *</Label>
              <Select
                options={[
                  { value: 0, label: "Select payment method" },
                  ...paymentMethods.map((method) => ({
                    value: method.id,
                    label: method.name,
                  })),
                ]}
                value={expenseForm.paymentMethodId}
                onValueChange={(value) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    paymentMethodId: Number(value),
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Category *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryDialogOpen(true)}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add New
                </Button>
              </div>
              <Select
                options={[
                  { value: 0, label: "Select category" },
                  ...categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  })),
                ]}
                value={expenseForm.categoryId}
                onValueChange={(value) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    categoryId: Number(value),
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Date</Label>
              <Input
                type="text"
                value={expenseForm.date.toLocaleDateString()}
                disabled
                className="mt-1 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Reference No (Optional)
              </Label>
              <Input
                type="text"
                value={expenseForm.referenceNo}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    referenceNo: e.target.value,
                  }))
                }
                placeholder="Enter reference number"
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpenseDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="max-w-xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogClose onClose={() => setIsCategoryDialogOpen(false)} />
          </DialogHeader>

          <form onSubmit={handleCategorySubmit} className="p-6 pt-0 space-y-4">
            <div>
              <Label className="text-sm font-medium">Category Name *</Label>
              <Input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Input
                type="text"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter category description"
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
