"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Shield, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"


const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 234-5678",
    role: "manager",
    status: "active",
    lastLogin: "2024-01-14",
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike@example.com",
    phone: "+1 (555) 345-6789",
    role: "staff",
    status: "active",
    lastLogin: "2024-01-13",
  },
  {
    id: 4,
    name: "Emma Davis",
    email: "emma@example.com",
    phone: "+1 (555) 456-7890",
    role: "staff",
    status: "inactive",
    lastLogin: "2024-01-10",
  },
]

export function UsersView() {
  const router = useRouter();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div
          onClick={() => {
            router.back();
          }}
          className="px-3 py-2 bg-gray-300 rounded-md inline-block mb-4 cursor-pointer"
        >
          <ArrowLeft className="text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">User Management</h2>
        <p className="text-sm text-muted-foreground">Manage staff and admin accounts</p>
      </div>

      <div className="space-y-3">
        {mockUsers.map((user) => (
          <Card key={user.id} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{user.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(user.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{user.phone}</span>
                </div>
                <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                  Last login: {user.lastLogin}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
