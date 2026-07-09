import express from "express";

import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../schema/product.schema.js";

import { validate } from "../middleware/validate.middleware.js";
import { isAuth } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/create-product",
  isAuth,
  upload.single("productImage"),
  validate(createProductSchema),
  createProductController
);

router.get(
  "/",
  isAuth,
  getAllProductsController
);

router.get(
  "/:id",
  isAuth,
  getProductByIdController
);

router.put(
  "/:id",
  isAuth,
  upload.single("productImage"),
  validate(updateProductSchema),
  updateProductController
);

router.delete(
  "/:id",
  isAuth,
  deleteProductController
);

export default router;