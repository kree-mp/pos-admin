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

const UserFormSchema = z.object({
  username: z.string().min(1, "Username is required"),

  email: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "waiter"], {
    message: "Role is required",
  }),
});

const SalesUpdateSchema = z.object({
  paymentStatus: z.enum(["paid", "pending"], {
    message: "Payment status is required",
  }),
  orderStatus: z.enum(["preparing", "ready", "served", "cancelled"], {
    message: "Order status is required",
  }),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  orderType: z.enum(["dine-in", "takeaway", "delivery"], {
    message: "Order type is required",
  }),
  tableId: z.string().min(1, "Table is required"),
  partyId: z.string().min(1, "Customer is required"),
  subTotal: z.number().min(0, "Subtotal must be positive"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  tax: z.number().min(0, "Tax cannot be negative").default(0),
  total: z.number().min(0, "Total must be positive"),
  notes: z.string().optional(),
  salesItems: z.array(z.object({
    id: z.number().optional(),
    itemName: z.string().min(1, "Item name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be positive"),
    totalPrice: z.number().min(0, "Total price must be positive"),
    notes: z.string().optional(),
    menuItemId: z.number().optional(),
  })).optional(),
});

export {
  PartyFormSchema,
  PartyTransactionFormSchema,
  MenuCategoryFormSchema,
  MenuItemFormSchema,
  UserFormSchema,
  SalesUpdateSchema,
};
