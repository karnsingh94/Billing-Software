import express from "express";

import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  deletePaymentController,
} from "../controllers/payment.controller.js";

import { createPaymentSchema } from "../schema/payment.schema.js";

import { validate } from "../middleware/validate.middleware.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  isAuth,
  validate(createPaymentSchema),
  createPaymentController
);

router.get("/", isAuth, getAllPaymentsController);

router.get("/:id", isAuth, getPaymentByIdController);

router.delete("/:id", isAuth, deletePaymentController);

export default router;