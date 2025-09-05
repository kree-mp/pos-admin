"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/use-user";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddUserForm } from "./add-user";

export function UsersView() {
  const router = useRouter();
  const { data: users, isLoading, error } = useUser();
  const [showNewUserForm, setShowNewUserForm] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "waiter":
        return "bg-green-100 text-green-800";
      case "staff":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
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
          <h2 className="text-lg font-semibold text-foreground mb-1">
            User Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage staff and admin accounts
          </p>
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
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
          <h2 className="text-lg font-semibold text-foreground mb-1">
            User Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage staff and admin accounts
          </p>
        </div>

        <Card className="border border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-red-600">
              Failed to load users. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <div className="flex justify-between items-center">
          <div
            onClick={() => {
              router.back();
            }}
            className="px-3 py-2 bg-gray-300 rounded-md inline-block mb-4 cursor-pointer"
          >
            <ArrowLeft className="text-3xl" />
          </div>
          <Button onClick={() => setShowNewUserForm(true)} className="mb-4">
            Add New User
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          User Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage staff and admin accounts
        </p>
      </div>

      <div className="space-y-3">
        {users && users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{user.username}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(user.role)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role}
                        </Badge>
                        <Badge className={getStatusColor(user.isActive)}>
                          {user.isActive ? "active" : "inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {user.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                    <div>User ID: {user.id}</div>
                    <div>
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    {user.updatedAt !== user.createdAt && (
                      <div>
                        Updated: {new Date(user.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border border-border">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No users found.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showNewUserForm} onOpenChange={setShowNewUserForm}>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <AddUserForm onClose={() => setShowNewUserForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UsersPage() {
  return <UsersView />;
}
