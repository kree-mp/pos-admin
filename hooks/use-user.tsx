"use client";
import { UsersResponse } from "@/types/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function useUser() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();

        const res = await axios.get<UsersResponse>(`${baseUrl}/users`, {
          headers: userId ? { userId } : {},
        });


        return res.data.data as UsersResponse["data"];
      } catch (error) {
        toast.error("Error getting users");
        console.error("Error fetching users data: ", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });
}
