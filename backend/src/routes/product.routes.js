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

import upload from "../middleware/upload.middleware.js";
import { isAuth, isSuperAdmin, isAdmin , isProduct} from "../middleware/auth.middleware.js"

const router = express.Router();

router.post(
  "/create-product",
  isAuth,isProduct,
  upload.single("productImage"),
  validate(createProductSchema),
  createProductController
);

router.get(
  "/get-products",
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