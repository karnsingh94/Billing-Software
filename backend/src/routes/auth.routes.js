
import { Router } from "express";

import {
  signup,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
  updatePassword,
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

import {
  validate,
} from "../middleware/validate.middleware.js";

const router = Router();

// ======================================================
// 1. SUPER ADMIN SIGNUP
// ======================================================

router.post(
  "/signup",
  validate(signupSchema),
  signup
);

// ======================================================
// 2. LOGIN
// ======================================================

router.post(
  "/login",
  validate(loginSchema),
  login
);

// ======================================================
// 3. CREATE ADMIN
// Sirf Super Admin create kar sakta hai
// ======================================================

router.post(
  "/create-admin",
  isAuth,
  isSuperAdmin,
  validate(createAdminSchema),
  createAdmin
);

// ======================================================
// 4. CREATE USER
// Admin aur Super Admin create kar sakte hain
// ======================================================

router.post(
  "/create-user",
  isAuth,
  isAdmin,
  validate(createUserSchema),
  createUser
);

// ======================================================
// 5. UPDATE PASSWORD
// Login hona required hai
// ======================================================

router.put(
  "/update-password",
  isAuth,
  updatePassword
);

// ======================================================
// 6. LOGOUT
// ======================================================

router.post(
  "/logout",
  isAuth,
  logout
);

// ======================================================
// 7. GET LOGGED-IN USER
// ======================================================

router.get(
  "/me",
  isAuth,
  getMe
);

export default router;

