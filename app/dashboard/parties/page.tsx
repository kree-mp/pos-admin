"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, ArrowLeft, Loader2, DollarSign, Users, Receipt, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import useParties from "@/hooks/use-parties";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { Party, PartyTransaction } from "@/types/api-response";

export default function PartiesPage() {
  const router = useRouter();
  const { data: partiesData, isLoading, error } = useParties();
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Separate hook call for transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useParties(selectedPartyId || undefined);

  // Type guard to ensure we're working with Party[] for the main list
  const parties = partiesData as Party[] | undefined;

  // Type guard for transactions
  const transactions = selectedPartyId ? (transactionsData as PartyTransaction[] | undefined) : undefined;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "bg-blue-100 text-blue-800";
      case "supplier":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getTransactionTypeColor = (type: string) => {
    return type === "credit" ? "text-green-600" : "text-red-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePartyClick = (party: Party) => {
    setSelectedPartyId(party.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPartyId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !parties) {
    return (
      <div className="space-y-4 p-4">
        <div
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading parties data</p>
        </div>
      </div>
    );
  }

  const customerCount = parties.filter(party => party.type === "customer").length;
  const supplierCount = parties.filter(party => party.type === "supplier").length;
  const totalBalance = parties.reduce((sum, party) => sum + party.balance, 0);
  const activeParties = parties.filter(party => party.isActive).length;

  return (
    <div className="space-y-4 p-4">
      <div>
        <div
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block mb-4 cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Parties Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage customers and suppliers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="text-2xl font-bold text-blue-700">
                  {customerCount}
                </p>
              </div>
              <p className="text-sm text-blue-600">Customers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="w-5 h-5 text-green-600" />
                <p className="text-2xl font-bold text-green-700">
                  {supplierCount}
                </p>
              </div>
              <p className="text-sm text-green-600">Suppliers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <p className="text-xl font-bold text-purple-700">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <p className="text-sm text-purple-600">Total Balance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-orange-600" />
                <p className="text-2xl font-bold text-orange-700">
                  {activeParties}
                </p>
              </div>
              <p className="text-sm text-orange-600">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parties Grid */}
      {parties.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {parties.map((party) => (
            <Card 
              key={party.id} 
              className="border border-border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePartyClick(party)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${party.type === 'customer' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {party.type === 'customer' ? (
                        <Users className={`w-5 h-5 ${party.type === 'customer' ? 'text-blue-600' : 'text-green-600'}`} />
                      ) : (
                        <User className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base font-medium">
                        {party.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        ID: #{party.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(party.type)}>
                      {party.type.charAt(0).toUpperCase() + party.type.slice(1)}
                    </Badge>
                    {!party.isActive && (
                      <Badge className="bg-red-100 text-red-800">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {party.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{party.phone}</span>
                    </div>
                  )}
                  {party.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{party.email}</span>
                    </div>
                  )}
                  {party.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{party.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className={getBalanceColor(party.balance)}>
                      Balance: {formatCurrency(party.balance)}
                    </span>
                  </div>
                </div>
                {(party.createdAt || party.updatedAt) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {party.createdAt && (
                        <span>Created: {new Date(party.createdAt).toLocaleDateString()}</span>
                      )}
                      {party.updatedAt && (
                        <span>Updated: {new Date(party.updatedAt).toLocaleDateString()}</span>
                      )}
                      {!party.createdAt && !party.updatedAt && (
                        <span>No date information available</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">No parties found</p>
          <p className="text-muted-foreground text-sm">Customers and suppliers will appear here when they are added</p>
        </div>
      )}

      {/* Party Transactions Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Party Transactions
              {transactions && transactions.length > 0 && transactions[0].Party && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {transactions[0].Party.name}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {transactions && transactions.length > 0 && transactions[0].Party ? (
                <div className="flex items-center gap-4 mt-2">
                  <span>Type: {transactions[0].Party.type.charAt(0).toUpperCase() + transactions[0].Party.type.slice(1)}</span>
                  <span>Current Balance: {formatCurrency(transactions[0].Party.balance)}</span>
                </div>
              ) : (
                "View all transactions for this party"
              )}
            </DialogDescription>
            <DialogClose onClose={handleCloseDialog} />
          </DialogHeader>
          
          <div className="p-6 pt-2">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {/* Party Information Card */}
                {transactions[0].Party && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${transactions[0].Party.type === 'customer' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {transactions[0].Party.type === 'customer' ? (
                              <Users className="w-4 h-4 text-blue-600" />
                            ) : (
                              <User className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{transactions[0].Party.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {transactions[0].Party.type.charAt(0).toUpperCase() + transactions[0].Party.type.slice(1)} • ID #{transactions[0].Party.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getBalanceColor(transactions[0].Party.balance)}`}>
                            {formatCurrency(transactions[0].Party.balance)}
                          </p>
                          <p className="text-xs text-muted-foreground">Current Balance</p>
                        </div>
                      </div>
                      {(transactions[0].Party.phone || transactions[0].Party.email || transactions[0].Party.address) && (
                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-300 text-xs text-muted-foreground">
                          {transactions[0].Party.phone && (
                            <span>📞 {transactions[0].Party.phone}</span>
                          )}
                          {transactions[0].Party.email && (
                            <span>✉️ {transactions[0].Party.email}</span>
                          )}
                          {transactions[0].Party.address && (
                            <span>📍 {transactions[0].Party.address}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Transaction Summary and List */}
                {/* Transaction Summary */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <p className="text-lg font-bold text-green-700">
                            {formatCurrency(
                              transactions
                                .filter(t => t.type === "credit")
                                .reduce((sum, t) => sum + t.amount, 0)
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-green-600">Total Credits</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(
                              transactions
                                .filter(t => t.type === "debit")
                                .reduce((sum, t) => sum + t.amount, 0)
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-red-600">Total Debits</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <p className="text-lg font-bold text-blue-700">
                            {transactions.length}
                          </p>
                        </div>
                        <p className="text-xs text-blue-600">Total Transactions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transactions List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header with type and amount */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {transaction.type === 'credit' ? (
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Transaction #{transaction.id}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${getTransactionTypeColor(transaction.type)}`}>
                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Date & Reference</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                                </div>
                                {transaction.reference && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Ref: {transaction.reference}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Balance Change</p>
                              <div className="text-xs">
                                <span className="text-muted-foreground">Before: </span>
                                <span className="font-medium">{formatCurrency(transaction.balanceBefore)}</span>
                                <br />
                                <span className="text-muted-foreground">After: </span>
                                <span className="font-medium">{formatCurrency(transaction.balanceAfter)}</span>
                              </div>
                            </div>
                          </div>

                          {/* User Information */}
                          {transaction.User && (
                            <div className="pt-2 border-t border-border/30">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span>Created by: </span>
                                <span className="font-medium">{transaction.User.username}</span>
                                <span>({transaction.User.role})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found for this party</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
