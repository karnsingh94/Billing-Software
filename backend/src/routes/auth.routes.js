
import { Router } from "express";
import {
  signup,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
  updatePassword,
  getAllAdmins,
  getAllUsers,
  toggleAdminStatus,
  toggleUserStatus,
  deleteAdmin,
  deleteUser,
  updateAdmin,
  updateUser,
} from "../controllers/auth.controller.js";
import {
  signupSchema,
  loginSchema,
  createAdminSchema,
  createUserSchema,
    updateUserSchema,
} from "../schema/auth.schema.js";

import {
  isAuth,
  isSuperAdmin,
  isAdmin,
} from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

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

// ======================================================
// 8. GET ALL ADMINS (SUPER ADMIN)
// ======================================================

router.get(
  "/admins",
  isAuth,
  isSuperAdmin,
  getAllAdmins
);

// ======================================================
// 9. GET ALL USERS (ADMIN)
// ======================================================

router.get(
  "/users",
  isAuth,
  isAdmin,
  getAllUsers
);

// ======================================================
// 10. ACTIVATE / DEACTIVATE ADMIN (SUPER ADMIN)
// ======================================================

router.patch(
  "/admin/:id/status",
  isAuth,
  isSuperAdmin,
  toggleAdminStatus
);

// ======================================================
// 11. ACTIVATE / DEACTIVATE USER (ADMIN)
// ======================================================

router.patch(
  "/user/:id/status",
  isAuth,
  isAdmin,
  toggleUserStatus
);

// ======================================================
// DELETE ADMIN (SUPER ADMIN)
// ======================================================

router.delete(
  "/admin/:id",
  isAuth,
  isSuperAdmin,
  deleteAdmin
);

// ======================================================
// DELETE USER (ADMIN)
// ======================================================

router.delete(
  "/user/:id",
  isAuth,
  isAdmin,
  deleteUser
);


router.put(
  "/admin/:id",
  isAuth,
  isSuperAdmin,
  updateAdmin
);


// ======================================================
// UPDATE USER (ADMIN)
// ======================================================

router.put(
  "/user-update/:id",
  isAuth,
  isAdmin,
  validate(updateUserSchema),
  updateUser
);


export default router;

