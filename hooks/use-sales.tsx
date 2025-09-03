"use client";
import { CartResponse } from "@/types/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();

        const res = await axios.get<CartResponse>(`${baseUrl}/sales/`, {
          headers: userId ? { userId } : {},
        });

        console.log("Sales data fetched :", res.data.data);

        return res.data.data as CartResponse["data"];
      } catch (error) {
        toast.error("Error getting sales");
        console.error("Error fetching sales data: ", error);
      }
    },
    refetchOnWindowFocus: false,
  });
}
