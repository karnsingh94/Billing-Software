import  prisma  from "../db/db.js";

// ================= CREATE DISCOUNT =================

export const createDiscount = async (req, res) => {
  try {
    const {
      discountType,
      discountValue,
      minAmount,
      maxDiscountAmount,
      discountAmount,
      invoiceId,
    } = req.body;

    if (!discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "discountType and discountValue are required",
      });
    }

    if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "discountType must be PERCENTAGE or FIXED",
      });
    }

    if (Number(discountValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: "discountValue must be greater than 0",
      });
    }

    // Percentage 100 se jyada nahi hona chahiye
    if (
      discountType === "PERCENTAGE" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot be greater than 100",
      });
    }

    // Agar invoiceId diya hai to invoice check karo
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }
    }

    const discount = await prisma.discount.create({
      data: {
        discountType,
        discountValue: Number(discountValue),

        minAmount:
          minAmount !== undefined && minAmount !== null
            ? Number(minAmount)
            : null,

        maxDiscountAmount:
          maxDiscountAmount !== undefined &&
          maxDiscountAmount !== null
            ? Number(maxDiscountAmount)
            : null,

        discountAmount:
          discountAmount !== undefined &&
          discountAmount !== null
            ? Number(discountAmount)
            : null,

        invoiceId: invoiceId || null,
      },
      include: {
        invoice: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Discount created successfully",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL DISCOUNTS =================

export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        invoice: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "All discounts fetched successfully",
      total: discounts.length,
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET DISCOUNT BY ID =================

export const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await prisma.discount.findUnique({
      where: {
        id,
      },
      include: {
        invoice: true,
      },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Discount fetched successfully",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE DISCOUNT =================

export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      discountType,
      discountValue,
      minAmount,
      maxDiscountAmount,
      discountAmount,
      invoiceId,
    } = req.body;

    const existingDiscount = await prisma.discount.findUnique({
      where: {
        id,
      },
    });

    if (!existingDiscount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    if (
      discountType &&
      !["PERCENTAGE", "FIXED"].includes(discountType)
    ) {
      return res.status(400).json({
        success: false,
        message: "discountType must be PERCENTAGE or FIXED",
      });
    }

    if (
      discountValue !== undefined &&
      Number(discountValue) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "discountValue must be greater than 0",
      });
    }

    const finalDiscountType =
      discountType || existingDiscount.discountType;

    const finalDiscountValue =
      discountValue !== undefined
        ? Number(discountValue)
        : existingDiscount.discountValue;

    if (
      finalDiscountType === "PERCENTAGE" &&
      finalDiscountValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot be greater than 100",
      });
    }

    // Agar naya invoiceId diya hai to invoice check karo
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }
    }

    const updatedDiscount = await prisma.discount.update({
      where: {
        id,
      },
      data: {
        discountType,
        discountValue:
          discountValue !== undefined
            ? Number(discountValue)
            : undefined,

        minAmount:
          minAmount !== undefined
            ? minAmount === null
              ? null
              : Number(minAmount)
            : undefined,

        maxDiscountAmount:
          maxDiscountAmount !== undefined
            ? maxDiscountAmount === null
              ? null
              : Number(maxDiscountAmount)
            : undefined,

        discountAmount:
          discountAmount !== undefined
            ? discountAmount === null
              ? null
              : Number(discountAmount)
            : undefined,

        invoiceId:
          invoiceId !== undefined
            ? invoiceId || null
            : undefined,
      },
      include: {
        invoice: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Discount updated successfully",
      data: updatedDiscount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE DISCOUNT =================

export const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await prisma.discount.findUnique({
      where: {
        id,
      },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    await prisma.discount.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};