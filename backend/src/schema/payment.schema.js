import { z } from "zod";

export const createPaymentSchema = z.object({
  customerName: z
    .string()
    .min(1, "Customer name is required"),

  productName: z
    .string()
    .min(1, "Product name is required"),

  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than 0"),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  discountValue: z.coerce
    .number()
    .min(0, "Discount value cannot be negative")
    .default(0),

  discountPercent: z.coerce
    .number()
    .min(0, "Discount percentage cannot be negative")
    .max(100, "Discount percentage cannot exceed 100")
    .default(0),

  paymentMethod: z.enum([
    "CASH",
    "UPI",
    "CARD",
    "ONLINE",
  ]),

  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0"),

  currency: z
    .string()
    .default("INR"),
});

export const updatePaymentSchema =
  createPaymentSchema.partial();