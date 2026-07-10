import { z } from "zod";

const numberField = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value), {
    message: "Value must be a valid number",
  });

export const createInvoiceSchema = z.object({
  body: z.object({
    paymentId: z
      .string()
      .uuid("Valid paymentId is required"),

    customerName: z
      .string()
      .trim()
      .min(
        2,
        "Customer name must contain at least 2 characters"
      )
      .optional(),

    currency: z
      .string()
      .trim()
      .min(1, "Currency is required")
      .optional()
      .default("INR"),

    gst: numberField
      .refine(
        (value) => value >= 0 && value <= 100,
        {
          message: "GST must be between 0 and 100",
        }
      )
      .optional()
      .default(0),

    discount: z
      .object({
        discountType: z.enum([
          "PERCENTAGE",
          "FIXED",
        ]),

        discountValue: numberField.refine(
          (value) => value >= 0,
          {
            message:
              "Discount value cannot be negative",
          }
        ),
      })
      .optional()
      .nullable(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    customerName: z
      .string()
      .trim()
      .min(2)
      .optional(),

    currency: z
      .string()
      .trim()
      .min(1)
      .optional(),
  }),
});

export const cancelInvoiceSchema = z.object({
  body: z.object({
    remarks: z
      .string()
      .trim()
      .min(2)
      .optional(),
  }),
});

export const invoiceQuerySchema = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .optional(),

    status: z
      .enum([
        "PENDING",
        "PARTIAL",
        "PAID",
        "CANCELLED",
        "REFUNDED",
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