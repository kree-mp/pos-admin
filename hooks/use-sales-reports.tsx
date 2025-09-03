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

export interface SalesReportResponse {
  statusCode: number;
  data: SalesReport[];
  message: string;
  status: boolean;
}

export interface SalesReport {
  id: number;
  invoiceNumber: string;
  tableId: number;
  partyId: number;
  paymentMethodId: number;
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: "paid" | "pending" | "partial";
  orderStatus: "pending" | "preparing" | "ready" | "served" | "cancelled";
  orderType: "dine-in" | "takeaway" | "delivery";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  Table: {
    id: number;
    name: string;
    status: string;
  };
  Party: {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    balance: number;
  };
  PaymentMethod: {
    id: number;
    name: string;
  };
  User: {
    id: number;
    username: string;
  };
  SalesItems: {
    id: number;
    itemName: string;
    quantity: number;
    rate: number;
    totalPrice: number;
    notes: string | null;
  }[];
  Payments: {
    id: number;
    amount: number;
    PaymentMethod: {
      id: number;
      name: string;
    };
  }[];
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

export default function useSalesReports(period: TimePeriod = "1day") {
  return useQuery({
    queryKey: ["sales-reports", period],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();
        const { startDate, endDate } = getDateRange(period);

        const res = await axios.get<SalesReportResponse>(
          `${baseUrl}/reports/sales?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: userId ? { userId } : {},
          }
        );

        console.log("Sales reports data fetched:", res.data.data);
        return res.data.data;
      } catch (error) {
        toast.error("Error getting sales reports");
        console.error("Error fetching sales reports data: ", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });
}

// Hook for custom date range
export function useSalesReportsDateRange(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["sales-reports-custom", startDate, endDate],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();

        if (!startDate || !endDate) {
          throw new Error("Start date and end date are required");
        }

        const res = await axios.get<SalesReportResponse>(
          `${baseUrl}/reports/sales?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: userId ? { userId } : {},
          }
        );

        console.log("Sales reports data fetched:", res.data.data);
        return res.data.data;
      } catch (error) {
        toast.error("Error getting sales reports");
        console.error("Error fetching sales reports data: ", error);
        throw error;
      }
    },
    enabled: !!startDate && !!endDate,
    refetchOnWindowFocus: false,
  });
}
