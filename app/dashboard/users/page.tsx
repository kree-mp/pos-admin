"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Shield,
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  User as UserIcon,
  Key,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/use-user";
import type { User } from "@/types/api-response";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddUserForm } from "./add-user";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseUrl) throw new Error("BASE_URL is not defined");

async function deleteUserById(id: number | string) {
  const res = await fetch(`${baseUrl}/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

type UpdateUserData = Partial<Pick<User, "username" | "role">> & {
  password?: string;
};

async function updateUserById(id: number | string, data: UpdateUserData) {
  const res = await fetch(`${baseUrl}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
}

async function handlePwChange(id: number, pw: string) {
  if (!pw || pw.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return false;
  }

  try {
    const res = await fetch(`${baseUrl}/users/change-password/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: pw }),
    });

    if (!res.ok) throw new Error("Failed to update password");
    toast.success("Password updated successfully");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to update password");
    return false;
  }
}

export function UsersView() {
  const router = useRouter();
  const { data: users, isLoading, error } = useUser();
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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

  const handlePwSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isSuccess = await handlePwChange(editUser!.id, newPassword);

    if (isSuccess) {
      setShowPwForm(false);
      setEditUser(null);
      setNewPassword("");
    }
  };

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
          <Button
            onClick={() => {
              setShowNewUserForm(true);
              setEditUser(null);
            }}
            className="mb-4"
          >
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
                      <UserIcon className="w-5 h-5 text-primary" />
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
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setEditUser(user);
                        setShowNewUserForm(true);
                      }}
                      title="Edit user"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setEditUser(user);
                        setShowPwForm(true);
                      }}
                      title="Edit user"
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setDeleteUserId(user.id)}
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

      {/* Add/Edit User Dialog */}
      <Dialog
        open={showNewUserForm}
        onOpenChange={(open) => {
          setShowNewUserForm(open);
          if (!open) setEditUser(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>{editUser ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <AddUserForm
            onClose={() => {
              setShowNewUserForm(false);
              setEditUser(null);
            }}
            user={editUser ?? undefined}
            onSubmit={async (formData: UpdateUserData) => {
              if (editUser) {
                const updateData: UpdateUserData = {};
                if (
                  formData.username &&
                  formData.username !== editUser.username
                )
                  updateData.username = formData.username;
                if (formData.role && formData.role !== editUser.role)
                  updateData.role = formData.role;
                if (formData.password) updateData.password = formData.password;
                try {
                  await updateUserById(editUser.id, updateData);
                  setShowNewUserForm(false);
                  setEditUser(null);
                  router.refresh();
                } catch {
                  toast.error("Failed to update user");
                }
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteUserId}
        onOpenChange={(open) => {
          if (!open) setDeleteUserId(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4 p-4">
            <p>Are you sure you want to delete this user?</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteUserId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteUserById(deleteUserId!);
                    setDeleteUserId(null);
                    router.refresh();
                  } catch {
                    toast.error("Failed to delete user");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={showPwForm}
        onOpenChange={(open) => {
          setShowPwForm(open);
          if (!open) setEditUser(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handlePwSubmit} className="space-y-4 p-4">
            <div className="space-y-4 p-4">
              <Label>New Password for {editUser?.username}</Label>
              <Input
                type="password"
                name="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mb-4">
              Update Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UsersPage() {
  return <UsersView />;
}
