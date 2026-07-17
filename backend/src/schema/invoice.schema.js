import { z } from "zod";

// ======================================================
// CREATE INVOICE
// ======================================================

export const createInvoiceSchema = z.object({
  body: z.object({
    paymentId: z
      .string({
        required_error: "Payment ID is required",
      })
      .uuid("Valid payment ID is required"),

    customerName: z
      .string()
      .trim()
      .min(
        2,
        "Customer name must contain at least 2 characters"
      )
      .max(
        150,
        "Customer name cannot exceed 150 characters"
      )
      .optional(),

    currency: z
      .string()
      .trim()
      .min(1, "Currency is required")
      .max(
        10,
        "Currency cannot exceed 10 characters"
      )
      .optional()
      .default("INR"),
  }),
});

// ======================================================
// UPDATE INVOICE
// ======================================================

export const updateInvoiceSchema = z.object({
  body: z
    .object({
      customerName: z
        .string()
        .trim()
        .min(
          2,
          "Customer name must contain at least 2 characters"
        )
        .max(
          150,
          "Customer name cannot exceed 150 characters"
        )
        .optional(),

      currency: z
        .string()
        .trim()
        .min(1, "Currency is required")
        .max(
          10,
          "Currency cannot exceed 10 characters"
        )
        .optional(),
    })
    .refine(
      (data) =>
        data.customerName !== undefined ||
        data.currency !== undefined,
      {
        message:
          "At least one field is required for update",
      }
    ),
});

// ======================================================
// CANCEL INVOICE
// ======================================================

export const cancelInvoiceSchema = z.object({
  body: z.object({
    remarks: z
      .string()
      .trim()
      .min(
        2,
        "Remarks must contain at least 2 characters"
      )
      .max(
        500,
        "Remarks cannot exceed 500 characters"
      )
      .optional(),
  }),
});

// ======================================================
// UPDATE INVOICE STATUS
// ======================================================

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "PENDING",
      "PARTIAL",
      "PAID",
      "CANCELLED",
      "REFUNDED",
    ]),

    remarks: z
      .string()
      .trim()
      .min(
        2,
        "Remarks must contain at least 2 characters"
      )
      .max(
        500,
        "Remarks cannot exceed 500 characters"
      )
      .optional(),
  }),
});

// ======================================================
// INVOICE ID PARAM
// ======================================================

export const invoiceIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Invoice ID is required",
      })
      .uuid("Invalid invoice ID"),
  }),
});

// ======================================================
// INVOICE NUMBER PARAM
// ======================================================

export const invoiceNumberSchema = z.object({
  params: z.object({
    invoiceNumber: z
      .string({
        required_error:
          "Invoice number is required",
      })
      .trim()
      .min(
        1,
        "Invoice number is required"
      ),
  }),
});

// ======================================================
// GET ALL INVOICES QUERY
// ======================================================

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

    startDate: z
      .string()
      .trim()
      .optional(),

    endDate: z
      .string()
      .trim()
      .optional(),

    page: z.coerce
      .number()
      .int("Page must be an integer")
      .positive(
        "Page must be greater than zero"
      )
      .optional()
      .default(1),

    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .positive(
        "Limit must be greater than zero"
      )
      .max(
        100,
        "Limit cannot exceed 100"
      )
      .optional()
      .default(10),
  }),
});