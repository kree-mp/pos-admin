"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useParties from "@/hooks/use-parties";
import { PartyTransactionFormSchema } from "@/schema/FormSchema";
import React, { useState } from "react";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const AddPartyTransaction = ({ onClose }: { onClose: () => void }) => {
  const { data: parties, isLoading: partiesLoading } = useParties();

  console.log(`Parties data:`, parties);

  const [formData, setFormData] = useState({
    partyId: "",
    type: "",
    amount: "",
    reference: "",
    description: "",
    createdBy: 1,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await PartyTransactionFormSchema.safeParseAsync(formData);

      const response = await fetch(`${baseUrl}/parties/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to add party transaction:", data);
        throw new Error("Failed to add party transaction");
      }

      toast.success("Party transaction added successfully!");
    } catch (error) {
      console.error("Error adding party transaction:", error);
      toast.error("Failed to add party transaction. Please try again.");
    } finally {
      setFormData({
        partyId: "",
        type: "",
        amount: "",
        reference: "",
        description: "",
        createdBy: 1,
      });

      setIsLoading(false);

      onClose();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add new party</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Party</Label>
            <Select
              required
              value={formData.partyId}
              onValueChange={(value) =>
                setFormData({ ...formData, partyId: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Party" />
              </SelectTrigger>
              <SelectContent>
                {partiesLoading ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : parties && parties.length > 0 ? (
                  parties.map((party) => (
                    <SelectItem key={party.id} value={party.id.toString()}>
                      {party.id} - {"name" in party ? party.name : "Unknown"}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="">No parties available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Transaction Type</Label>
            <Select
              required
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Cash receipt</SelectItem>
                <SelectItem value="debit">Cash Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Amount</Label>
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Amount"
            />
          </div>

          <div>
            <Label>Reference</Label>
            <Input
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              placeholder="Reference"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Description"
              required
            />
          </div>

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? "Adding..." : "Create Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPartyTransaction;
