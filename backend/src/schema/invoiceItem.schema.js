import { z } from "zod";

const numberField = z.coerce
  .number({
    message: "Value must be a valid number",
  })
  .finite("Value must be a valid number");

// ======================================================
// CREATE INVOICE ITEM
// ======================================================

export const createInvoiceItemSchema = z.object({
  body: z.object({
    quantity: numberField
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than zero"),

    price: numberField
      .positive("Price must be greater than zero"),

    gst: numberField
      .min(0, "GST cannot be negative")
      .max(100, "GST cannot exceed 100")
      .optional()
      .default(0),

    invoiceId: z
      .string()
      .uuid("Valid invoiceId is required"),

    productId: z
      .string()
      .uuid("Valid productId is required"),
  }),
});

// ======================================================
// UPDATE INVOICE ITEM
// ======================================================

export const updateInvoiceItemSchema = z.object({
  body: z
    .object({
      quantity: numberField
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than zero")
        .optional(),

      price: numberField
        .positive("Price must be greater than zero")
        .optional(),

      gst: numberField
        .min(0, "GST cannot be negative")
        .max(100, "GST cannot exceed 100")
        .optional(),

      invoiceId: z
        .string()
        .uuid("Invalid invoiceId")
        .optional(),

      productId: z
        .string()
        .uuid("Invalid productId")
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required for update",
      }
    ),
});

// ======================================================
// INVOICE ITEM ID
// ======================================================

export const invoiceItemIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid invoice item ID"),
  }),
});

// ======================================================
// INVOICE ID
// ======================================================

export const invoiceIdSchema = z.object({
  params: z.object({
    invoiceId: z
      .string()
      .uuid("Invalid invoice ID"),
  }),
});

// ======================================================
// GET ALL QUERY
// ======================================================

export const invoiceItemQuerySchema = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .optional(),

    invoiceId: z
      .string()
      .uuid("Invalid invoiceId")
      .optional(),

    productId: z
      .string()
      .uuid("Invalid productId")
      .optional(),

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
  }),
});