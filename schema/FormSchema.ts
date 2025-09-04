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

export { PartyFormSchema };
