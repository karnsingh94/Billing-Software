import express from "express";

import {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discount.controller.js";

import { isAuth } from "../middleware/auth.middleware.js";
// import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Create discount
router.post("/create-discount", isAuth,  createDiscount);

// Get all discounts
router.get("/get-allDiscount", isAuth, getAllDiscounts);

// Get discount by id
router.get("/getDiscount/:id", isAuth, getDiscountById);

// Update discount
router.put("/update-discount/:id", isAuth, updateDiscount);

// Delete discount
router.delete("/delete-discount/:id", isAuth, deleteDiscount);


export default router;