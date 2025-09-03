"use client";
import {
  PartiesResponse,
  PartyTransactionsResponse,
} from "@/types/api-response";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function useParties(partyId?: number) {
  return useQuery({
    queryKey: partyId ? ["party-transactions", partyId] : ["parties"],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();

        if (partyId) {
          const possibleEndpoints = [
            `${baseUrl}/party/transaactions/${partyId}`,
            `${baseUrl}/parties/${partyId}/transactions`,
            `${baseUrl}/parties/transactions/${partyId}`,
            `${baseUrl}/party/transactions/${partyId}`,
          ];

          let res;
          let lastError: AxiosError | null = null;

          for (const endpoint of possibleEndpoints) {
            try {
              console.log(`Trying endpoint: ${endpoint}`);
              res = await axios.get<PartyTransactionsResponse>(endpoint, {
                headers: userId ? { userId } : {},
              });
              console.log(
                `✅ SUCCESS: Party transactions fetched from: ${endpoint}`,
                res.data
              );
              break;
            } catch (error) {
              if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`❌ 404: Endpoint not found: ${endpoint}`);
                lastError = error;
                continue;
              } else {
                console.error(`❌ ERROR: Non-404 error at ${endpoint}:`, error);
                throw error;
              }
            }
          }

          if (!res) {
            throw lastError || new Error("All transaction endpoints failed");
          }

          return res.data.data || [];
        } else {
          const res = await axios.get<PartiesResponse>(`${baseUrl}/parties`, {
            headers: userId ? { userId } : {},
          });
          console.log("Parties data fetched:", res.data);
          return res.data.data || [];
        }
      } catch (error) {
        toast.error(
          partyId ? "Error getting party transactions" : "Error getting parties"
        );
        console.error(
          partyId
            ? "Error fetching party transactions:"
            : "Error fetching parties data:",
          error
        );

        return [];
      }
    },
    refetchOnWindowFocus: false,
    enabled: partyId ? partyId > 0 : true,
  });
}
