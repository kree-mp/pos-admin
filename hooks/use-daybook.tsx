"use client";
import { DaybookTodaySummaryResponse, DaybookSummaryResponse } from "@/types/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function useDaybook(date?: string) {
  const isToday = !date || date === new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["daybook", date],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();

        if (isToday) {
          // Fetch today's summary with transactions
          const res = await axios.get<DaybookTodaySummaryResponse>(
            `${baseUrl}/daybook/today-summary`,
            {
              headers: userId ? { userId } : {},
            }
          );
          return res.data.data;
        } else {
          // Fetch historical summary for specific date
          const res = await axios.get<DaybookSummaryResponse>(
            `${baseUrl}/daybook/summary/${date}`,
            {
              headers: userId ? { userId } : {},
            }
          );
          return {
            ...res.data.data,
            transactions: [], // Historical data doesn't include transactions
          };
        }
      } catch (error) {
        toast.error("Error getting daybook data");
        console.error("Error fetching daybook data: ", error);
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });
}
