import express from "express";
import {
  createInvoiceItem,
  getAllInvoiceItems,
  getInvoiceItemById,
  getInvoiceItemsByInvoiceId,
  updateInvoiceItem,
  deleteInvoiceItem,
} from "../controllers/invoiceItem.controller.js";

const router = express.Router();

// Create invoice item
router.post("/create", createInvoiceItem);

// Get all invoice items
router.get("/get-all", getAllInvoiceItems);

// Get single invoice item by item id
router.get("/get/:id", getInvoiceItemById);

// Get all items of one invoice
router.get("/invoice/:invoiceId", getInvoiceItemsByInvoiceId);

// Update invoice item
router.put("/update/:id", updateInvoiceItem);

// Delete invoice item
router.delete("/delete/:id", deleteInvoiceItem);

export default router;