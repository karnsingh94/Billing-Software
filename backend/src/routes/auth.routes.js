import { Router } from "express";

<<<<<<< HEAD
import { signup, updatePassword,  login, createAdmin , createUser , logout , getMe} from "../controllers/auth.controller.js";
import { isAuth, isSuperAdmin, isAdmin} from "../middleware/auth.middleware.js"
=======
import {
  signup,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
>>>>>>> 3b53bc7 (feat: add period report generation functionality with date range filtering)

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

<<<<<<< HEAD
router.post("/signup",signup );
router.put("/update-password", isAuth, updatePassword);
router.post("/login", login);
router.post("/create-admin", isAuth, isSuperAdmin, createAdmin);
router.post("/create-user", isAuth, isAdmin, createUser);
router.post("/logout", isAuth, logout);
router.get("/me", isAuth, getMe);
=======
router.post(
  "/signup",
  validate(signupSchema),
  signup
);
>>>>>>> 3b53bc7 (feat: add period report generation functionality with date range filtering)

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