import { z } from "zod";

const numberField = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value), {
    message: "Value must be a valid number",
  });

const invoiceItemSchema = z.object({
  productId: z
    .string()
    .uuid("Valid productId is required"),

  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),

  /*
   * Price is optional.
   * If not provided, Product.sellingPrice will be used.
   */
  price: numberField
    .refine((value) => value > 0, {
      message: "Price must be greater than zero",
    })
    .optional(),

  gst: numberField
    .refine((value) => value >= 0 && value <= 100, {
      message: "GST must be between 0 and 100",
    })
    .optional()
    .default(0),
});

const discountSchema = z.object({
  discountType: z.enum([
    "PERCENTAGE",
    "FIXED",
  ]),

  discountValue: numberField.refine(
    (value) => value >= 0,
    {
      message: "Discount value cannot be negative",
    }
  ),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    customerName: z
      .string()
      .trim()
      .min(
        2,
        "Customer name must contain at least 2 characters"
      ),

    currency: z
      .string()
      .trim()
      .min(1, "Currency is required")
      .optional()
      .default("INR"),

    items: z
      .array(invoiceItemSchema)
      .min(1, "At least one invoice item is required"),

    discount: discountSchema
      .optional()
      .nullable(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
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
      .optional(),
  }),
});

export const cancelInvoiceSchema = z.object({
  body: z.object({
    remarks: z
      .string()
      .trim()
      .min(
        2,
        "Cancellation remarks must contain at least 2 characters"
      )
      .max(
        500,
        "Remarks cannot exceed 500 characters"
      )
      .optional(),
  }),
});

export const invoiceQuerySchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),

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
        .int("Page must be an integer")
        .positive("Page must be greater than zero")
        .optional()
        .default(1),

      limit: z.coerce
        .number()
        .int("Limit must be an integer")
        .positive("Limit must be greater than zero")
        .max(100, "Limit cannot exceed 100")
        .optional()
        .default(10),
    })
    .superRefine((data, ctx) => {
      if (data.startDate) {
        const startDate = new Date(data.startDate);

        if (Number.isNaN(startDate.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startDate"],
            message: "Invalid startDate",
          });
        }
      }

      if (data.endDate) {
        const endDate = new Date(data.endDate);

        if (Number.isNaN(endDate.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "Invalid endDate",
          });
        }
      }

      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (startDate > endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message:
              "endDate must be greater than or equal to startDate",
          });
        }
      }
    }),
});