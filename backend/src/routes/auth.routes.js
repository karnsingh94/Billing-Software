import { Router } from "express";

import {
  signup,
  updatePassword,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
} from "../controllers/auth.controller.js";

import {
  signupSchema,
  loginSchema,
  createAdminSchema,
  createUserSchema,
} from "../schema/auth.schema.js";

import {
  isAuth,
  isSuperAdmin,
  isAdmin,
} from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post(
  "/signup",
  validate(signupSchema),
  signup
);

router.put(
  "/update-password",
  isAuth,
  updatePassword
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post(
  "/create-admin",
  isAuth,
  isSuperAdmin,
  validate(createAdminSchema),
  createAdmin
);

router.post(
  "/create-user",
  isAuth,
  isAdmin,
  validate(createUserSchema),
  createUser
);

router.post(
  "/logout",
  isAuth,
  logout
);

router.get(
  "/me",
  isAuth,
  getMe
);

export default router;