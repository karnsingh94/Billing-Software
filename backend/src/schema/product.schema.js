import { z } from "zod";

export const createProductSchema = z.object({
  productName: z
    .string()
    .min(1, "Product name is required"),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative")
    .default(0),

  sellingPrice: z.coerce
    .number()
    .positive("Selling price must be greater than 0"),
});

export const updateProductSchema = z.object({
  productName: z
    .string()
    .min(1, "Product name is required")
    .optional(),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative")
    .optional(),

  sellingPrice: z.coerce
    .number()
    .positive("Selling price must be greater than 0")
    .optional(),
});