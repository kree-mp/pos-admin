"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Truck, Utensils, Zap } from "lucide-react"

interface ExpensesViewProps {
  onBack: () => void
}

const mockExpenses = [
  {
    id: 1,
    description: "Food Supplies",
    amount: 320.5,
    category: "inventory",
    date: "2024-01-15",
    vendor: "Fresh Foods Co.",
  },
  {
    id: 2,
    description: "Electricity Bill",
    amount: 180.25,
    category: "utilities",
    date: "2024-01-14",
    vendor: "Power Company",
  },
  {
    id: 3,
    description: "Kitchen Equipment",
    amount: 250.0,
    category: "equipment",
    date: "2024-01-12",
    vendor: "Restaurant Supply",
  },
  {
    id: 4,
    description: "Delivery Service",
    amount: 89.75,
    category: "services",
    date: "2024-01-10",
    vendor: "Quick Delivery",
  },
]

export function ExpensesView({ onBack }: ExpensesViewProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Utensils className="w-4 h-4" />
      case "utilities":
        return <Zap className="w-4 h-4" />
      case "equipment":
        return <Receipt className="w-4 h-4" />
      case "services":
        return <Truck className="w-4 h-4" />
      default:
        return <Receipt className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "inventory":
        return "bg-orange-100 text-orange-800"
      case "utilities":
        return "bg-yellow-100 text-yellow-800"
      case "equipment":
        return "bg-blue-100 text-blue-800"
      case "services":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Expenses</h2>
        <p className="text-sm text-muted-foreground">Track your business expenses</p>
      </div>

      {/* Total Expenses Card */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">${totalExpenses.toFixed(2)}</p>
            </div>
            <Receipt className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-3">
        {mockExpenses.map((expense) => (
          <Card key={expense.id} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">{getCategoryIcon(expense.category)}</div>
                  <div>
                    <h4 className="font-medium text-sm">{expense.description}</h4>
                    <p className="text-xs text-muted-foreground">{expense.vendor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">${expense.amount.toFixed(2)}</p>
                  <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{expense.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
