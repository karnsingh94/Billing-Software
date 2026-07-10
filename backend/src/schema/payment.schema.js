import { z } from "zod";

const paymentStatusEnum = z.enum([
  "PAID",
  "PENDING",
  "PARTIAL",
  "REFUNDED",
]);

const paymentMethodEnum = z.enum([
  "CASH",
  "UPI",
  "CARD",
  "ONLINE",
  "BANK_TRANSFER",
]);

const decimalField = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value), {
    message: "Value must be a valid number",
  });

const optionalDateField = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date format",
  })
  .optional();

export const createPaymentSchema = z.object({
  body: z
    .object({
      invoiceId: z
        .string()
        .uuid("Valid invoiceId is required")
        .optional()
        .nullable(),

      productId: z
        .string()
        .uuid("Valid productId is required"),

      customerName: z
        .string()
        .trim()
        .min(2, "Customer name must contain at least 2 characters"),

      quantity: z.coerce
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than zero"),

      price: decimalField
        .refine((value) => value > 0, {
          message: "Price must be greater than zero",
        })
        .optional(),

      discountValue: decimalField
        .refine((value) => value >= 0, {
          message: "Discount value cannot be negative",
        })
        .optional()
        .default(0),

      discountPercent: decimalField
        .refine((value) => value >= 0 && value <= 100, {
          message: "Discount percentage must be between 0 and 100",
        })
        .optional()
        .default(0),

      amount: decimalField.refine((value) => value >= 0, {
        message: "Payment amount cannot be negative",
      }),

      paymentMethod: paymentMethodEnum,

      currency: z
        .string()
        .trim()
        .min(1, "Currency is required")
        .default("INR"),
    })
    .superRefine((data, ctx) => {
      if (data.discountValue > 0 && data.discountPercent > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountValue"],
          message:
            "Use either discountValue or discountPercent, not both together",
        });
      }
    }),
});

export const updatePaymentStatusSchema = z.object({
  body: z.object({
    paymentStatus: paymentStatusEnum,

    remarks: z
      .string()
      .trim()
      .max(500, "Remarks cannot exceed 500 characters")
      .optional(),
  }),
});

export const refundPaymentSchema = z.object({
  body: z.object({
    refundAmount: decimalField.refine((value) => value > 0, {
      message: "Refund amount must be greater than zero",
    }),

    remarks: z
      .string()
      .trim()
      .min(2, "Refund remarks must contain at least 2 characters")
      .max(500, "Refund remarks cannot exceed 500 characters")
      .optional(),
  }),
});

export const paymentQuerySchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),

      paymentStatus: paymentStatusEnum.optional(),

      paymentMethod: paymentMethodEnum.optional(),

      startDate: optionalDateField,
      endDate: optionalDateField,

      page: z.coerce
        .number()
        .int("Page must be an integer")
        .positive("Page must be greater than zero")
        .default(1),

      limit: z.coerce
        .number()
        .int("Limit must be an integer")
        .positive("Limit must be greater than zero")
        .max(100, "Limit cannot exceed 100")
        .default(10),
    })
    .superRefine((data, ctx) => {
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (startDate > endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "endDate must be greater than or equal to startDate",
          });
        }
      }
    }),
});