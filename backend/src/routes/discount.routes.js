import express from "express";
import {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discount.controller.js";

const router = express.Router();

router.post("/create-discount", createDiscount);
router.get("/get-all", getAllDiscounts);
router.get("/get/:id", getDiscountById);
router.put("/update/:id", updateDiscount);
router.delete("/delete/:id", deleteDiscount);

export default router;