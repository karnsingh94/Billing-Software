import { Router } from "express";

import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  getPaymentByNumberController,
  updatePaymentStatusController,
  refundPaymentController,
  getPaymentStatsController,
} from "../controllers/payment.controller.js";

import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  refundPaymentSchema,
  paymentQuerySchema,
} from "../schema/payment.schema.js";

import { validate } from "../middleware/validate.middleware.js";

import { isAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * All payment APIs require login
 */
router.use(isAuth);

/**
 * Create payment
 */
router.post(
  "/",
  validate(createPaymentSchema),
  createPaymentController
);

/**
 * Payment statistics
 *
 * Keep before /:paymentId
 */
router.get(
  "/stats",
  getPaymentStatsController
);

/**
 * Get payment by payment number
 */
router.get(
  "/number/:paymentNumber",
  getPaymentByNumberController
);

/**
 * Get all payments
 */
router.get(
  "/",
  validate(paymentQuerySchema),
  getAllPaymentsController
);

/**
 * Update payment status
 */
router.patch(
  "/:paymentId/status",
  validate(updatePaymentStatusSchema),
  updatePaymentStatusController
);

/**
 * Refund payment
 */
router.post(
  "/:paymentId/refund",
  validate(refundPaymentSchema),
  refundPaymentController
);

/**
 * Get payment by ID
 *
 * Keep at bottom
 */
router.get(
  "/:paymentId",
  getPaymentByIdController
);

export default router;