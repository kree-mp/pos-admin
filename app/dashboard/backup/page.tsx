"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const BackupPage = () => {
  const router = useRouter();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const createBackup = async () => {
    if (isCreatingBackup) {
      return;
    }

    setIsCreatingBackup(true);

    toast.loading("Creating backup...", { id: "backup-process" });

    try {
      const res = await fetch(`${baseUrl}/backup/secret/create-backup`);

      if (!res.ok) {
        throw new Error("Failed to create backup");
      }

      toast.success("Backup created successfully!", { id: "backup-process" });
      router.replace("/dashboard");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup. Please try again.", {
        id: "backup-process",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

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
              Backup Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Create and manage your database backups
            </p>
          </div>
        </div>
      </div>
      <div className="h-full pt-40 flex items-center justify-center">
        <Button
          onClick={createBackup}
          disabled={isCreatingBackup}
          variant="ghost"
          className="flex flex-col gap-4 text-xl font-semibold text-foreground h-24 w-64 rounded-lg p-20 px-12 border border-gray-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingBackup ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 text-primary animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mr-2 text-primary" />
              Create Backup
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BackupPage;
