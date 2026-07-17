import { z } from "zod";

const numberField = z.coerce
  .number({
    message: "Value must be a valid number",
  })
  .finite("Value must be a valid number");

export const createProductSchema = z.object({
  body: z.object({
    productName: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .max(150, "Product name cannot exceed 150 characters"),

    productPrice: numberField.positive(
      "Product price must be greater than 0"
    ),

    gst: numberField
      .min(0, "GST cannot be negative")
      .max(100, "GST cannot exceed 100")
      .optional()
      .default(0),

    stock: numberField
      .int("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .optional()
      .default(0),
  }),
});

export const updateProductSchema = z.object({
  body: z
    .object({
      productName: z
        .string()
        .trim()
        .min(1, "Product name is required")
        .max(150)
        .optional(),

      productPrice: numberField
        .positive("Product price must be greater than 0")
        .optional(),

      gst: numberField
        .min(0, "GST cannot be negative")
        .max(100, "GST cannot exceed 100")
        .optional(),

      stock: numberField
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .optional(),

      productImage: z
        .string()
        .trim()
        .optional()
        .nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),

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