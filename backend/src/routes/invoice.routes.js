import { Router } from "express";

import {
  createInvoiceController,
  getAllInvoicesController,
  getInvoiceByIdController,
  getInvoiceByNumberController,
  updateInvoiceController,
  cancelInvoiceController,
  getInvoiceStatsController,
} from "../controllers/invoice.controller.js";

import {
  createInvoiceSchema,
  updateInvoiceSchema,
  cancelInvoiceSchema,
  invoiceQuerySchema,
} from "../schema/invoice.schema.js";

import { validate } from "../middleware/validate.middleware.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(isAuth);

// Create invoice
router.post(
  "/",
  validate(createInvoiceSchema),
  createInvoiceController
);

// Invoice statistics
// Keep before /:invoiceId
router.get(
  "/stats",
  getInvoiceStatsController
);

// Get invoice by invoice number
router.get(
  "/number/:invoiceNumber",
  getInvoiceByNumberController
);

// Get all invoices
router.get(
  "/",
  validate(invoiceQuerySchema),
  getAllInvoicesController
);

// Update invoice basic details
router.patch(
  "/:invoiceId",
  validate(updateInvoiceSchema),
  updateInvoiceController
);

// Cancel invoice
router.patch(
  "/:invoiceId/cancel",
  validate(cancelInvoiceSchema),
  cancelInvoiceController
);

// Get invoice by ID
// Keep at bottom
router.get(
  "/:invoiceId",
  getInvoiceByIdController
);

export default router;