import prisma from "../config/prisma.js";

const generatePaymentNumber = () => {
  return `PAY-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`;
};

// CREATE PAYMENT
export const createPaymentService = async (data, userId) => {
  const quantity = Number(data.quantity);
  const price = Number(data.price);
  const amount = Number(data.amount);

  const discountValue = Number(
    data.discountValue ?? 0
  );

  const discountPercent = Number(
    data.discountPercent ?? 0
  );

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!data.customerName) {
    throw new Error("Customer name is required");
  }

  if (!data.productName) {
    throw new Error("Product name is required");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(
      "Quantity must be greater than 0"
    );
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(
      "Price must be greater than 0"
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Amount must be greater than 0"
    );
  }

  if (
    !Number.isFinite(discountValue) ||
    discountValue < 0
  ) {
    throw new Error(
      "Discount value cannot be negative"
    );
  }

  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    throw new Error(
      "Discount percentage must be between 0 and 100"
    );
  }

  // Original total
  const totalPrice = quantity * price;

  // Percentage discount amount
  const percentageDiscountAmount =
    (totalPrice * discountPercent) / 100;

  // Total discount
  const discountAmount =
    discountValue + percentageDiscountAmount;

  // Prevent discount greater than total price
  if (discountAmount > totalPrice) {
    throw new Error(
      "Discount cannot be greater than total price"
    );
  }

  // Final price after discount
  const finalPrice =
    totalPrice - discountAmount;

  let paymentStatus = "PENDING";

  if (amount >= finalPrice) {
    paymentStatus = "PAID";
  } else if (amount > 0) {
    paymentStatus = "PARTIAL";
  }

  const payment = await prisma.payment.create({
    data: {
      customerName: data.customerName,
      productName: data.productName,

      quantity,
      price,
      totalPrice,

      discountValue,
      discountPercent,
      discountAmount,
      finalPrice,

      paymentNumber: generatePaymentNumber(),

      paymentMethod: data.paymentMethod,
      amount,
      currency: data.currency || "INR",
      paymentStatus,

      userId,
      createdBy: userId,
    },

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  return payment;
};

// GET ALL PAYMENTS
export const getAllPaymentsService = async () => {
  return await prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// GET PAYMENT BY ID
export const getPaymentByIdService = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id,
    },

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

// DELETE PAYMENT
export const deletePaymentService = async (id) => {
  const payment =
    await prisma.payment.findUnique({
      where: {
        id,
      },
    });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return await prisma.payment.delete({
    where: {
      id,
    },
  });
};