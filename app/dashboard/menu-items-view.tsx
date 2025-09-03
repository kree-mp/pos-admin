"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, DollarSign } from "lucide-react"

interface MenuItemsViewProps {
  onBack: () => void
}

const mockMenuItems = [
  {
    id: 1,
    name: "Grilled Salmon",
    price: 24.99,
    category: "main",
    rating: 4.8,
    available: true,
    description: "Fresh Atlantic salmon with herbs",
  },
  {
    id: 2,
    name: "Caesar Salad",
    price: 12.99,
    category: "appetizer",
    rating: 4.5,
    available: true,
    description: "Crisp romaine with parmesan",
  },
  {
    id: 3,
    name: "Chocolate Cake",
    price: 8.99,
    category: "dessert",
    rating: 4.9,
    available: false,
    description: "Rich chocolate layer cake",
  },
  {
    id: 4,
    name: "Beef Burger",
    price: 16.99,
    category: "main",
    rating: 4.6,
    available: true,
    description: "Angus beef with fresh toppings",
  },
  {
    id: 5,
    name: "Tomato Soup",
    price: 7.99,
    category: "appetizer",
    rating: 4.3,
    available: true,
    description: "Creamy tomato with basil",
  },
]

export function MenuItemsView({ onBack }: MenuItemsViewProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "main":
        return "bg-blue-100 text-blue-800"
      case "appetizer":
        return "bg-green-100 text-green-800"
      case "dessert":
        return "bg-pink-100 text-pink-800"
      case "beverage":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Menu Items</h2>
        <p className="text-sm text-muted-foreground">Manage your restaurant menu</p>
      </div>

      <div className="space-y-3">
        {mockMenuItems.map((item) => (
          <Card key={item.id} className={`border ${item.available ? "border-border" : "border-red-200 bg-red-50"}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    {!item.available && (
                      <Badge variant="destructive" className="text-xs">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium">{item.price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
