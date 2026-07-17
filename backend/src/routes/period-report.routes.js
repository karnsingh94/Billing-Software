import express from "express";

import {
  getDateRangeReportController,
} from "../controllers/period-report.controller.js";

import {
  reportQuerySchema,
} from "../schema/period-report.schema.js";

import {
  validate,
} from "../middleware/validate.middleware.js";

import {
  isAuth,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// GET dynamic date-wise report
router.get(
  "/",
  isAuth,
  validate(reportQuerySchema),
  getDateRangeReportController
);

export default router;