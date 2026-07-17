
import prisma from "../db/db.js";

// ======================================================
// COMMON COUPON SELECT
// ======================================================

const couponSelect = {
  id: true,
  couponName: true,
  couponCode: true,
  discountType: true,
  discountValue: true,
  minOrderAmount: true,
  maxOrderAmount: true,
  maxDiscountAmount: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,

  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
};

// ======================================================
// CUSTOM SERVICE ERROR
// ======================================================

const createServiceError = (
  message,
  statusCode = 500
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

// ======================================================
// 1. CREATE COUPON SERVICE
// ======================================================

export const createCouponService = async ({
  couponData,
  loggedInUserId,
}) => {
  const {
    couponName,
    couponCode,
    discountType,
    discountValue,
    minOrderAmount,
    maxOrderAmount,
    maxDiscountAmount,
    isActive,
  } = couponData;

  /*
    Coupon code uppercase mein save hoga.

    flat100 -> FLAT100
    summer20 -> SUMMER20
  */

  const normalizedCode = couponCode
    .trim()
    .toUpperCase();

  /*
    Check karenge ki coupon code
    pehle se available hai ya nahi.
  */

  const existingCoupon =
    await prisma.coupon.findUnique({
      where: {
        couponCode: normalizedCode,
      },
    });

  if (existingCoupon) {
    throw createServiceError(
      "Coupon code already exists",
      409
    );
  }

  /*
    Transaction ka use:

    1. Coupon create hoga
    2. Audit log create hoga

    Agar audit create hone mein error aaya,
    to coupon bhi database mein save nahi hoga.
  */

  const coupon =
    await prisma.$transaction(
      async (tx) => {
        const createdCoupon =
          await tx.coupon.create({
            data: {
              couponName,

              couponCode:
                normalizedCode,

              discountType,

              discountValue,

              minOrderAmount:
                minOrderAmount ?? null,

              maxOrderAmount:
                maxOrderAmount ?? null,

              maxDiscountAmount:
                maxDiscountAmount ?? null,

              isActive,

              createdById:
                loggedInUserId,
            },

            select: couponSelect,
          });

        // ==============================================
        // CREATE COUPON AUDIT
        // ==============================================

        await tx.audit.create({
          data: {
            action:
              "CREATE_COUPON",

            table:
              "Coupon",

            /*
              Create operation mein purana data
              nahi hota, isliye oldValue null hai.
            */

            oldValue: null,

            /*
              Naya coupon data audit mein save hoga.
            */

            newValue: {
              id:
                createdCoupon.id,

              couponName:
                createdCoupon.couponName,

              couponCode:
                createdCoupon.couponCode,

              discountType:
                createdCoupon.discountType,

              discountValue:
                createdCoupon.discountValue,

              minOrderAmount:
                createdCoupon.minOrderAmount,

              maxOrderAmount:
                createdCoupon.maxOrderAmount,

              maxDiscountAmount:
                createdCoupon.maxDiscountAmount,

              isActive:
                createdCoupon.isActive,
            },

            createdBy:
              loggedInUserId,

            userId:
              loggedInUserId,
          },
        });

        return createdCoupon;
      }
    );

  return coupon;
};

// ======================================================
// 2. GET ALL COUPONS SERVICE
// ======================================================

export const getAllCouponsService =
  async ({
    status,
    search,
  }) => {
    const whereCondition = {};

    /*
      Active aur inactive coupons filter.
    */

    if (status === "active") {
      whereCondition.isActive = true;
    }

    if (status === "inactive") {
      whereCondition.isActive = false;
    }

    /*
      Coupon name ya coupon code se search.
    */

    if (
      search &&
      search.trim() !== ""
    ) {
      const searchValue =
        search.trim();

      whereCondition.OR = [
        {
          couponName: {
            contains:
              searchValue,
          },
        },
        {
          couponCode: {
            contains:
              searchValue.toUpperCase(),
          },
        },
      ];
    }

    const coupons =
      await prisma.coupon.findMany({
        where:
          whereCondition,

        orderBy: {
          createdAt: "desc",
        },

        select:
          couponSelect,
      });

    return coupons;
  };

// ======================================================
// 3. GET COUPON BY ID SERVICE
// ======================================================

export const getCouponByIdService =
  async (id) => {
    const coupon =
      await prisma.coupon.findUnique({
        where: {
          id,
        },

        select:
          couponSelect,
      });

    if (!coupon) {
      throw createServiceError(
        "Coupon not found",
        404
      );
    }

    return coupon;
  };

// ======================================================
// 4. APPLY COUPON SERVICE
// ======================================================

export const applyCouponService =
  async ({
    couponCode,
    totalPrice,
  }) => {
    /*
      Coupon code nahi bheja gaya.
    */

    if (
      !couponCode ||
      couponCode.trim() === ""
    ) {
      return {
        message:
          "No coupon applied",

        coupon: null,

        priceDetails: {
          originalPrice:
            Number(
              totalPrice.toFixed(2)
            ),

          discountAmount: 0,

          finalPrice:
            Number(
              totalPrice.toFixed(2)
            ),
        },
      };
    }

    const normalizedCode =
      couponCode
        .trim()
        .toUpperCase();

    const coupon =
      await prisma.coupon.findUnique({
        where: {
          couponCode:
            normalizedCode,
        },
      });

    /*
      Coupon database mein nahi mila.
    */

    if (!coupon) {
      throw createServiceError(
        "Invalid coupon code",
        404
      );
    }

    /*
      Coupon inactive hai.
    */

    if (!coupon.isActive) {
      throw createServiceError(
        "This coupon is currently inactive",
        400
      );
    }

    /*
      Minimum order amount check.
    */

    if (
      coupon.minOrderAmount !==
        null &&
      totalPrice <
        coupon.minOrderAmount
    ) {
      throw createServiceError(
        `Coupon can only be applied on orders of ₹${coupon.minOrderAmount} or more`,
        400
      );
    }

    /*
      Maximum order amount check.
    */

    if (
      coupon.maxOrderAmount !==
        null &&
      totalPrice >
        coupon.maxOrderAmount
    ) {
      throw createServiceError(
        `Coupon can only be applied on orders up to ₹${coupon.maxOrderAmount}`,
        400
      );
    }

    let discountAmount = 0;

    // ==================================================
    // PERCENTAGE DISCOUNT
    // ==================================================

    if (
      coupon.discountType ===
      "PERCENTAGE"
    ) {
      discountAmount =
        (totalPrice *
          coupon.discountValue) /
        100;

      /*
        Percentage discount par maximum
        discount limit lagayenge.
      */

      if (
        coupon.maxDiscountAmount !==
          null &&
        discountAmount >
          coupon.maxDiscountAmount
      ) {
        discountAmount =
          coupon.maxDiscountAmount;
      }
    }

    // ==================================================
    // FIXED DISCOUNT
    // ==================================================

    if (
      coupon.discountType ===
      "FIXED"
    ) {
      discountAmount =
        coupon.discountValue;
    }

    /*
      Discount bill amount se zyada
      nahi ho sakta.
    */

    discountAmount = Math.min(
      discountAmount,
      totalPrice
    );

    const finalPrice =
      totalPrice -
      discountAmount;

    return {
      message:
        "Coupon applied successfully",

      coupon: {
        id:
          coupon.id,

        couponName:
          coupon.couponName,

        couponCode:
          coupon.couponCode,

        discountType:
          coupon.discountType,

        discountValue:
          coupon.discountValue,

        minOrderAmount:
          coupon.minOrderAmount,

        maxOrderAmount:
          coupon.maxOrderAmount,

        maxDiscountAmount:
          coupon.maxDiscountAmount,
      },

      priceDetails: {
        originalPrice:
          Number(
            totalPrice.toFixed(2)
          ),

        discountAmount:
          Number(
            discountAmount.toFixed(2)
          ),

        finalPrice:
          Number(
            finalPrice.toFixed(2)
          ),
      },
    };
  };

// ======================================================
// 5. UPDATE COUPON STATUS SERVICE
// ======================================================

export const updateCouponStatusService =
  async ({
    id,
    isActive,
    loggedInUserId,
  }) => {
    const existingCoupon =
      await prisma.coupon.findUnique({
        where: {
          id,
        },
      });

    if (!existingCoupon) {
      throw createServiceError(
        "Coupon not found",
        404
      );
    }

    /*
      Transaction mein:

      1. Coupon status update hoga
      2. Audit log create hoga
    */

    const updatedCoupon =
      await prisma.$transaction(
        async (tx) => {
          const coupon =
            await tx.coupon.update({
              where: {
                id,
              },

              data: {
                isActive,
              },

              select: {
                id: true,
                couponName: true,
                couponCode: true,
                discountType: true,
                discountValue: true,
                minOrderAmount: true,
                maxOrderAmount: true,
                maxDiscountAmount: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            });

          // ============================================
          // UPDATE COUPON STATUS AUDIT
          // ============================================

          await tx.audit.create({
            data: {
              action:
                "UPDATE_COUPON_STATUS",

              table:
                "Coupon",

              /*
                Update se pehle coupon ki value.
              */

              oldValue: {
                id:
                  existingCoupon.id,

                couponName:
                  existingCoupon.couponName,

                couponCode:
                  existingCoupon.couponCode,

                isActive:
                  existingCoupon.isActive,
              },

              /*
                Update hone ke baad coupon ki value.
              */

              newValue: {
                id:
                  coupon.id,

                couponName:
                  coupon.couponName,

                couponCode:
                  coupon.couponCode,

                isActive:
                  coupon.isActive,
              },

              updatedBy:
                loggedInUserId,

              userId:
                loggedInUserId,
            },
          });

          return coupon;
        }
      );

    return updatedCoupon;
  };

