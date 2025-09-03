"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  ArrowLeft, 
  Calendar,
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard,
  DollarSign,
  Clock,
  Receipt
} from "lucide-react";
import { useRouter } from "next/navigation";
import useDaybook from "@/hooks/use-daybook";
import { DaybookTransaction } from "@/types/api-response";

export default function DaybookPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const dateString = selectedDate.toISOString().split('T')[0];
  const { data: daybookData, isLoading, error } = useDaybook(dateString);

  const isToday = dateString === new Date().toISOString().split('T')[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'opening_balance':
        return <Wallet className="w-4 h-4 text-blue-600" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-50 border-green-200';
      case 'expense':
        return 'bg-red-50 border-red-200';
      case 'opening_balance':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !daybookData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load daybook data</p>
      </div>
    );
  }

  const summary = 'summary' in daybookData ? daybookData.summary : daybookData;
  const transactions = 'transactions' in daybookData ? daybookData.transactions : [];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daybook</h1>
            <p className="text-sm text-muted-foreground">
              {isToday ? "Today's" : "Daily"} financial summary and transactions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <DatePicker
            date={selectedDate}
            onDateChange={(date) => setSelectedDate(date || new Date())}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Opening Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Cash:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.openingBalance.cash)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Online:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.openingBalance.online)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Cash:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(summary.sales.cash)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Online:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(summary.sales.online)}
                </span>
              </div>
              {'count' in summary.sales && typeof (summary.sales as {count?: number}).count === 'number' && (
                <div className="text-xs text-muted-foreground pt-1">
                  {(summary.sales as {count: number}).count} transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Cash:</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(summary.expenses.cash)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Online:</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(summary.expenses.online)}
                </span>
              </div>
              {'count' in summary.expenses && typeof (summary.expenses as {count?: number}).count === 'number' && (
                <div className="text-xs text-muted-foreground pt-1">
                  {(summary.expenses as {count: number}).count} transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Net Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Total</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Cash:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.netCash)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                <span className="text-xs text-muted-foreground">Online:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(summary.netOnline)}
                </span>
              </div>
              <div className="text-sm font-bold text-primary pt-1 border-t">
                Total: {formatCurrency(summary.totalNet)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List - Only show for today */}
      {isToday && transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today&apos;s Transactions ({transactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((transaction: DaybookTransaction) => (
                <div
                  key={transaction.id}
                  className={`p-3 rounded-lg border ${getTransactionColor(transaction.transactionType)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transactionType)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">
                            {transaction.transactionType.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.paymentMode}
                          </Badge>
                          {transaction.referenceId && (
                            <Badge variant="outline" className="text-xs">
                              #{transaction.referenceId}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No transactions message for historical dates */}
      {!isToday && (
        <Card>
          <CardContent className="p-6 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Transaction details are only available for today&apos;s records
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
