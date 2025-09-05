import z from "zod";

const PartyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z
    .enum(["customer", "supplier"], { message: "Type is required" })
    .default("customer"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional(),
  balance: z
    .number()
    .min(0, "Balance cannot be negative")
    .optional()
    .default(0),
  isActive: z.boolean().optional().default(true),
});

const PartyTransactionFormSchema = z.object({
  partyId: z.string().min(1, "Party is required"),
  type: z.enum(["credit", "debit"], {
    message: "Transaction type is required",
  }),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  reference: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export { PartyFormSchema, PartyTransactionFormSchema };
