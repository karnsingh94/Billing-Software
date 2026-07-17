import express from "express";

import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  refundPaymentController,
} from "../controllers/payment.controller.js";

import {
  createPaymentSchema,
  paymentIdSchema,
  paymentQuerySchema,
  refundPaymentSchema,
} from "../schema/payment.schema.js";

import {
  validate,
} from "../middleware/validate.middleware.js";

import {
  isAuth,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create-payment",
  isAuth,
  validate(createPaymentSchema),
  createPaymentController
);

router.get(
  "/",
  isAuth,
  validate(paymentQuerySchema),
  getAllPaymentsController
);

router.get(
  "/:id",
  isAuth,
  validate(paymentIdSchema),
  getPaymentByIdController
);

router.post(
  "/:id/refund",
  isAuth,
  validate(paymentIdSchema),
  validate(refundPaymentSchema),
  refundPaymentController
);

export default router;