"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export type TimePeriod = "1day" | "3days" | "7days" | "1month" | "6months";

export interface AnalyticsReportResponse {
  statusCode: number;
  data: AnalyticsReport;
  message: string;
  status: boolean;
}

export interface AnalyticsReport {
  summary: {
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  dailySales: {
    [date: string]: number;
  };
  topItems: {
    itemName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  orderTypeStats: {
    "dine-in": number;
    "takeaway": number;
    "delivery": number;
  };
  paymentMethodStats: {
    [methodName: string]: number;
  };
  orderStatusStats: {
    pending: number;
    preparing: number;
    ready: number;
    served: number;
    cancelled: number;
  };
  expenseCategories: {
    [categoryName: string]: number;
  };
}

const getDateRange = (period: TimePeriod) => {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  let startDate: string;

  switch (period) {
    case "1day":
      startDate = endDate;
      break;
    case "3days":
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      startDate = threeDaysAgo.toISOString().split('T')[0];
      break;
    case "7days":
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      startDate = sevenDaysAgo.toISOString().split('T')[0];
      break;
    case "1month":
      const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      startDate = oneMonthAgo.toISOString().split('T')[0];
      break;
    case "6months":
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      startDate = sixMonthsAgo.toISOString().split('T')[0];
      break;
    default:
      startDate = endDate;
  }

  return { startDate, endDate };
};

export default function useAnalyticsReports(period: TimePeriod = "1day") {
  return useQuery({
    queryKey: ["analytics-reports", period],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();
        const { startDate, endDate } = getDateRange(period);

        const res = await axios.get<AnalyticsReportResponse>(
          `${baseUrl}/reports/analytics?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: userId ? { userId } : {},
          }
        );

        console.log("Analytics reports data fetched:", res.data.data);
        return res.data.data;
      } catch (error) {
        toast.error("Error getting analytics reports");
        console.error("Error fetching analytics reports data: ", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });
}

// Hook for custom date range
export function useAnalyticsReportsDateRange(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["analytics-reports-custom", startDate, endDate],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();

        if (!startDate || !endDate) {
          throw new Error("Start date and end date are required");
        }

        const res = await axios.get<AnalyticsReportResponse>(
          `${baseUrl}/reports/analytics?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: userId ? { userId } : {},
          }
        );

        console.log("Analytics reports data fetched:", res.data.data);
        return res.data.data;
      } catch (error) {
        toast.error("Error getting analytics reports");
        console.error("Error fetching analytics reports data: ", error);
        throw error;
      }
    },
    enabled: !!startDate && !!endDate,
    refetchOnWindowFocus: false,
  });
}
