import prisma from "../db/db.js";

// discount calculate function
const calculateDiscountAmount = (discountType, discountValue, invoiceTotal) => {
  if (discountType === "PERCENTAGE") {
    return (invoiceTotal * discountValue) / 100;
  }

  if (discountType === "FIXED") {
    return discountValue;
  }

  return 0;
};

// CREATE DISCOUNT
export const createDiscount = async (req, res) => {
  try {
    const { discountType, discountValue, invoiceId } = req.body;

    if (!discountType || !discountValue || !invoiceId) {
      return res.status(400).json({
        success: false,
        message: "discountType, discountValue and invoiceId are required",
      });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const discountAmount = calculateDiscountAmount(
      discountType,
      Number(discountValue),
      Number(invoice.total)
    );

    const discount = await prisma.discount.create({
      data: {
        discountType,
        discountValue: Number(discountValue),
        discountAmount,
        invoiceId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Discount created successfully",
      discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL DISCOUNTS
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
      discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE DISCOUNT
export const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await prisma.discount.findUnique({
      where: { id },
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
      discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE DISCOUNT
export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountType, discountValue, invoiceId } = req.body;

    const oldDiscount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!oldDiscount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    const finalInvoiceId = invoiceId || oldDiscount.invoiceId;

    const invoice = await prisma.invoice.findUnique({
      where: { id: finalInvoiceId },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const finalDiscountType = discountType || oldDiscount.discountType;
    const finalDiscountValue =
      discountValue !== undefined
        ? Number(discountValue)
        : oldDiscount.discountValue;

    const discountAmount = calculateDiscountAmount(
      finalDiscountType,
      finalDiscountValue,
      Number(invoice.total)
    );

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        discountType: finalDiscountType,
        discountValue: finalDiscountValue,
        discountAmount,
        invoiceId: finalInvoiceId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Discount updated successfully",
      discount: updatedDiscount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE DISCOUNT
export const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    await prisma.discount.delete({
      where: { id },
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