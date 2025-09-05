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

const MenuCategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

const MenuItemFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  rate: z.number().min(0.01, "Rate must be greater than zero"),
  image: z.string().optional(),
  isAvailable: z.boolean().optional().default(true),
});

export {
  PartyFormSchema,
  PartyTransactionFormSchema,
  MenuCategoryFormSchema,
  MenuItemFormSchema,
};
