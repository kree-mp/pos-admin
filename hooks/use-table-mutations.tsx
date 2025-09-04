"use client";

import { getUserIdFromLocalStorage } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

interface TableCreateData {
  name: string;
  status?: "available" | "unavailable" | "reserved";
}

interface TableUpdateData {
  name?: string;
  status?: "available" | "unavailable" | "reserved";
}

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TableCreateData) => {
      const userId = getUserIdFromLocalStorage();
      
      const response = await axios.post(`${baseUrl}/tables`, data, {
        headers: userId ? { userId } : {},
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table created successfully");
    },
    onError: (error) => {
      console.error("Error creating table:", error);
      toast.error("Failed to create table");
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TableUpdateData }) => {
      const userId = getUserIdFromLocalStorage();
      
      const response = await axios.put(`${baseUrl}/tables/${id}`, data, {
        headers: userId ? { userId } : {},
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table updated successfully");
    },
    onError: (error) => {
      console.error("Error updating table:", error);
      toast.error("Failed to update table");
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const userId = getUserIdFromLocalStorage();
      
      const response = await axios.delete(`${baseUrl}/tables/${id}`, {
        headers: userId ? { userId } : {},
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting table:", error);
      toast.error("Failed to delete table");
    },
  });
}

export function useGetTable(id: number) {
  return useMutation({
    mutationFn: async () => {
      const userId = getUserIdFromLocalStorage();
      
      const response = await axios.get(`${baseUrl}/tables/${id}`, {
        headers: userId ? { userId } : {},
      });
      
      return response.data;
    },
    onError: (error) => {
      console.error("Error fetching table:", error);
      toast.error("Failed to fetch table details");
    },
  });
}
