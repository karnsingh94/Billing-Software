import express from "express";

import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  applyCoupon,
  updateCouponStatus,
} from "../controllers/coupon.controller.js";

import { isAuth , isAdmin} from "../middleware/auth.middleware.js";


const router = express.Router();

/*
  Sirf Admin ya Super Admin
  coupon create kar sakta hai.
*/

router.post(
  "/create-coupon",
  isAuth,
  isAdmin,
  createCoupon
);

/*
  Frontend coupon management table
  ke liye.
*/

router.get(
  "/get-coupon",
  isAuth,
  
  getAllCoupons
);

/*
  Coupon apply karna.
  Logged-in Admin/User dono use kar sakte hain.
*/

router.post(
  "/apply-coupon",
  isAuth,
  applyCoupon
);

/*
  Single coupon details
*/

router.get(
  "/apply-coupon:id",
  isAuth,
  isAdmin,
  getCouponById
);

/*
  Coupon active/inactive karna
*/

router.patch(
  "/:id/status",
  isAuth,
  isAdmin,
  updateCouponStatus
);

export default router;