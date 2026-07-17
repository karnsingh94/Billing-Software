import {
  createCouponSchema,
  applyCouponSchema,
} from "../schema/coupon.schema.js";

import {
  createCouponService,
  getAllCouponsService,
  getCouponByIdService,
  applyCouponService,
  updateCouponStatusService,
} from "../services/coupon.service.js";

// ======================================================
// COMMON ERROR RESPONSE
// ======================================================

const handleControllerError = (
  error,
  res,
  controllerName
) => {
  console.error(
    `${controllerName}:`,
    error
  );

  /*
    Prisma unique constraint error.
  */

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message:
        "Coupon code already exists",
    });
  }

  return res
    .status(error.statusCode || 500)
    .json({
      success: false,

      message:
        error.message ||
        "Internal server error",
    });
};

// ======================================================
// 1. CREATE COUPON
// ======================================================

export const createCoupon = async (
  req,
  res
) => {
  try {
    const result =
      createCouponSchema.safeParse(
        req.body
      );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",

        errors:
          result.error.flatten()
            .fieldErrors,
      });
    }

    /*
      Login user ki ID isAuth
      middleware se aayegi.
    */

    const loggedInUserId =
      req.user?.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized user",
      });
    }

    const coupon =
      await createCouponService({
        couponData:
          result.data,

        loggedInUserId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Coupon created successfully",
      coupon, 
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Create coupon error"
    );
  }
};

// ======================================================
// 2. GET ALL COUPONS
// ======================================================

export const getAllCoupons = async (
  req,
  res
) => {
  try {
    const {
      status,
      search,
    } = req.query;

    const coupons =
      await getAllCouponsService({
        status,
        search,
      });

    return res.status(200).json({
      success: true,

      message:
        "Coupons fetched successfully",

      totalCoupons:
        coupons.length,

      coupons,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Get all coupons error"
    );
  }
};

// ======================================================
// 3. GET SINGLE COUPON BY ID
// ======================================================

export const getCouponById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon ID is required",
      });
    }

    const coupon =
      await getCouponByIdService(
        id
      );

    return res.status(200).json({
      success: true,

      message:
        "Coupon fetched successfully",

      coupon,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Get coupon by ID error"
    );
  }
};

// ======================================================
// 4. APPLY COUPON
// ======================================================

export const applyCoupon = async (
  req,
  res
) => {
  try {
    const result =
      applyCouponSchema.safeParse(
        req.body
      );

    if (!result.success) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          result.error.flatten()
            .fieldErrors,
      });
    }

    const couponResult =
      await applyCouponService({
        couponCode:
          result.data.couponCode,

        totalPrice:
          result.data.totalPrice,
      });

    return res.status(200).json({
      success: true,

      message:
        couponResult.message,

      coupon:
        couponResult.coupon,

      priceDetails:
        couponResult.priceDetails,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Apply coupon error"
    );
  }
};

// ======================================================
// 5. UPDATE COUPON STATUS
// ======================================================

export const updateCouponStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { isActive } =
        req.body;

      if (!id) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Coupon ID is required",
          });
      }

      /*
        Sirf boolean accept hoga.

        Correct:
        {
          "isActive": true
        }

        Wrong:
        {
          "isActive": "true"
        }
      */

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "isActive must be true or false",
          });
      }

      /*
        Login user ki ID isAuth
        middleware se aayegi.
      */

      const loggedInUserId =
        req.user?.id;

      if (!loggedInUserId) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Unauthorized user",
          });
      }

      /*
        loggedInUserId service ko bhejenge,
        taaki Audit table mein updatedBy
        aur userId save ho sake.
      */

      const updatedCoupon =
        await updateCouponStatusService({
          id,
          isActive,
          loggedInUserId,
        });

      return res
        .status(200)
        .json({
          success: true,

          message: isActive
            ? "Coupon activated successfully"
            : "Coupon deactivated successfully",

          coupon:
            updatedCoupon,
        });
    } catch (error) {
      return handleControllerError(
        error,
        res,
        "Update coupon status error"
      );
    }
  };

