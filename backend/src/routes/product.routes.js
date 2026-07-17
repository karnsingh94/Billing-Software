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
  productIdSchema,
  productQuerySchema,
} from "../schema/product.schema.js";

import {
  validate,
} from "../middleware/validate.middleware.js";

import upload from "../middleware/upload.middleware.js";

import {
  isAuth,
  isProduct,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create-product",
  isAuth,
  isProduct,
  upload.single("productImage"),
  validate(createProductSchema),
  createProductController
);

router.get(
  "/get-products",
  isAuth,
  validate(productQuerySchema),
  getAllProductsController
);

router.get(
  "/:id",
  isAuth,
  validate(productIdSchema),
  getProductByIdController
);

router.put(
  "/:id",
  isAuth,
  isProduct,
  upload.single("productImage"),
  validate(productIdSchema),
  validate(updateProductSchema),
  updateProductController
);

router.delete(
  "/:id",
  isAuth,
  isProduct,
  validate(productIdSchema),
  deleteProductController
);

export default router;