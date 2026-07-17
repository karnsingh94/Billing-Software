import express from "express";

import {
  createInvoiceItem,
  getAllInvoiceItems,
  getInvoiceItemById,
  getInvoiceItemsByInvoiceId,
  updateInvoiceItem,
  deleteInvoiceItem,
} from "../controllers/invoiceItem.controller.js";

import {
  createInvoiceItemSchema,
  updateInvoiceItemSchema,
  invoiceItemIdSchema,
  invoiceIdSchema,
  invoiceItemQuerySchema,
} from "../schema/invoiceItem.schema.js";

import {
  isAuth,
} from "../middleware/auth.middleware.js";

import {
  validate,
} from "../middleware/validate.middleware.js";

const router = express.Router();

// All invoice item APIs require login
router.use(isAuth);

// Create invoice item
router.post(
  "/create",
  validate(createInvoiceItemSchema),
  createInvoiceItem
);

// Get all invoice items with pagination
router.get(
  "/get-all",
  validate(invoiceItemQuerySchema),
  getAllInvoiceItems
);

// Get all items belonging to one invoice
// Keep before /get/:id
router.get(
  "/invoice/:invoiceId",
  validate(invoiceIdSchema),
  getInvoiceItemsByInvoiceId
);

// Get one invoice item
router.get(
  "/get/:id",
  validate(invoiceItemIdSchema),
  getInvoiceItemById
);

// Update invoice item
router.put(
  "/update/:id",
  validate(invoiceItemIdSchema),
  validate(updateInvoiceItemSchema),
  updateInvoiceItem
);

// Delete invoice item
router.delete(
  "/delete/:id",
  validate(invoiceItemIdSchema),
  deleteInvoiceItem
);

export default router;