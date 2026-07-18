import { z } from "zod";

const paymentItemSchema = z.object({
  productId: z
    .string()
    .uuid("Invalid product ID"),

  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),
});

export const createPaymentSchema = z.object({
  body: z.object({
    customerName: z
      .string()
      .trim()
      .min(1, "Customer name is required")
      .optional(),

    paymentMethod: z.enum([
      "CASH",
      "UPI",
      "CARD",
      "ONLINE",
      "BANK_TRANSFER",
    ]),

    couponCode: z.string()
      .trim()
      .optional(),
    currency: z
      .string()
      .trim()
      .optional()
      .default("INR"),

    products: z
      .array(paymentItemSchema)
      .min(1, "At least one product is required"),
  }),
});

export const paymentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid payment ID"),
  }),
});

export const paymentQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),

    status: z
      .enum([
        "PAID",
        "PENDING",
        "PARTIAL",
        "REFUNDED",
      ])
      .optional(),

    paymentMethod: z
      .enum([
        "CASH",
        "UPI",
        "CARD",
        "ONLINE",
        "BANK_TRANSFER",
      ])
      .optional(),

    startDate: z.string().optional(),
    endDate: z.string().optional(),

    page: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(10),
  }),
});

export const refundPaymentSchema = z.object({
  body: z.object({
    remarks: z
      .string()
      .trim()
      .optional(),
  }),
});