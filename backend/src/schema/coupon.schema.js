import { z } from "zod";

// ======================================================
// CREATE COUPON SCHEMA
// ======================================================

const createCouponSchema = z
  .object({
    couponName: z
      .string()
      .trim()
      .min(
        2,
        "Coupon name must be at least 2 characters"
      )
      .max(
        50,
        "Coupon name cannot exceed 50 characters"
      ),

    couponCode: z
      .string()
      .trim()
      .min(
        4,
        "Coupon code must be at least 4 characters"
      )
      .max(
        20,
        "Coupon code cannot exceed 20 characters"
      )
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Coupon code can contain only letters and numbers"
      ),

    discountType: z.enum(
      ["PERCENTAGE", "FIXED"],
      {
        message:
          "Discount type must be PERCENTAGE or FIXED",
      }
    ),

    discountValue: z.coerce
      .number()
      .positive(
        "Discount value must be greater than 0"
      ),

    /*
      Coupon lagane ke liye minimum order amount.

      Example:
      minOrderAmount = 400

      Bill ₹400 ya usse zyada hona chahiye.
    */

    minOrderAmount: z.coerce
      .number()
      .min(
        0,
        "Minimum order amount cannot be negative"
      )
      .optional(),

    /*
      Coupon lagane ke liye maximum order amount.

      Example:
      maxOrderAmount = 5000

      Bill ₹5000 se zyada nahi hona chahiye.
    */

    maxOrderAmount: z.coerce
      .number()
      .positive(
        "Maximum order amount must be greater than 0"
      )
      .optional(),

    /*
      Percentage coupon mein maximum kitna
      discount diya ja sakta hai.

      Example:
      Discount = 20%
      maxDiscountAmount = ₹500
    */

    maxDiscountAmount: z.coerce
      .number()
      .positive(
        "Maximum discount amount must be greater than 0"
      )
      .optional(),

    isActive: z.coerce
      .boolean()
      .default(true),
  })
  .superRefine((data, ctx) => {
    /*
      Percentage discount 100 se
      zyada nahi ho sakta.
    */

    if (
      data.discountType === "PERCENTAGE" &&
      data.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountValue"],
        message:
          "Percentage discount cannot exceed 100%",
      });
    }

    /*
      FIXED coupon mein maxDiscountAmount
      ki zarurat nahi hoti.
    */

    if (
      data.discountType === "FIXED" &&
      data.maxDiscountAmount !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxDiscountAmount"],
        message:
          "Maximum discount amount is only allowed for percentage coupons",
      });
    }

    /*
      Maximum order amount minimum order
      amount se bada hona chahiye.

      Wrong:
      minOrderAmount = 1000
      maxOrderAmount = 500
    */

    if (
      data.minOrderAmount !== undefined &&
      data.maxOrderAmount !== undefined &&
      data.maxOrderAmount <=
        data.minOrderAmount
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxOrderAmount"],
        message:
          "Maximum order amount must be greater than minimum order amount",
      });
    }
  });

// ======================================================
// APPLY COUPON SCHEMA
// ======================================================

const applyCouponSchema = z.object({
  /*
    Coupon optional hai.

    Coupon code nahi aaya to:
    discountAmount = 0
    finalPrice = totalPrice
  */

  couponCode: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  totalPrice: z.coerce
    .number()
    .positive(
      "Total price must be greater than 0"
    ),
});

export {
  createCouponSchema,
  applyCouponSchema,
};