import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";

/*
If your Prisma file is inside src/lib/prisma.js, use:

import prisma from "../lib/prisma.js";

If your Prisma file is inside src/common/lib/prisma.js, use:

import prisma from "../common/lib/prisma.js";
*/

// ======================================================
// HELPERS
// ======================================================

const makeJsonSafe = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.parse(
    JSON.stringify(value, (_, item) => {
      if (item instanceof Prisma.Decimal) {
        return item.toNumber();
      }

      if (item instanceof Date) {
        return item.toISOString();
      }

      return item;
    })
  );
};

const generatePaymentNumber = () => {
  const date = new Date();

  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `PAY-${datePart}-${randomNumber}`;
};

const getUniquePaymentNumber = async (tx) => {
  let paymentNumber;
  let existingPayment;

  do {
    paymentNumber = generatePaymentNumber();

    existingPayment = await tx.payment.findUnique({
      where: {
        paymentNumber,
      },
      select: {
        id: true,
      },
    });
  } while (existingPayment);

  return paymentNumber;
};

const calculatePaymentStatus = (paidAmount, finalPrice) => {
  const paid = new Prisma.Decimal(paidAmount);
  const total = new Prisma.Decimal(finalPrice);

  if (paid.lessThanOrEqualTo(0)) {
    return "PENDING";
  }

  if (paid.lessThan(total)) {
    return "PARTIAL";
  }

  return "PAID";
};

const calculateInvoiceStatus = (paidAmount, totalAmount) => {
  const paid = new Prisma.Decimal(paidAmount);
  const total = new Prisma.Decimal(totalAmount);

  if (paid.lessThanOrEqualTo(0)) {
    return "PENDING";
  }

  if (paid.lessThan(total)) {
    return "PARTIAL";
  }

  return "PAID";
};

// ======================================================
// CREATE PAYMENT
// ======================================================

export const createPaymentService = async (
  input,
  loggedInUserId
) => {
  const {
    invoiceId,
    productId,
    customerName,
    quantity,
    price: inputPrice,
    discountValue = 0,
    discountPercent = 0,
    amount,
    paymentMethod,
    currency = "INR",
  } = input;

  return prisma.$transaction(async (tx) => {
    // --------------------------------------------------
    // Check logged-in user
    // --------------------------------------------------

    const user = await tx.user.findFirst({
      where: {
        id: loggedInUserId,
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error("Logged-in user not found");
    }

    // --------------------------------------------------
    // Validate quantity
    // --------------------------------------------------

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(
        "Quantity must be a positive integer"
      );
    }

    // --------------------------------------------------
    // Check product
    // --------------------------------------------------

    const product = await tx.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // --------------------------------------------------
    // Check invoice
    // --------------------------------------------------

    let invoice = null;

    if (invoiceId) {
      invoice = await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },
        include: {
          payment: true,
          items: true,
          discounts: true,
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status === "CANCELLED") {
        throw new Error(
          "Payment cannot be added to a cancelled invoice"
        );
      }

      if (invoice.status === "REFUNDED") {
        throw new Error(
          "Payment cannot be added to a refunded invoice"
        );
      }

      if (invoice.status === "PAID") {
        throw new Error("Invoice is already paid");
      }

      /*
       * Current Prisma schema allows only one payment
       * for one invoice.
       */
      if (invoice.paymentId || invoice.payment) {
        throw new Error(
          "This invoice already has a payment"
        );
      }

      const invoiceItem = invoice.items.find(
        (item) => item.productId === productId
      );

      if (!invoiceItem) {
        throw new Error(
          "Selected product does not exist in this invoice"
        );
      }
    }

    // --------------------------------------------------
    // Direct payment stock validation
    // --------------------------------------------------

    if (!invoiceId && product.stock < quantity) {
      throw new Error(
        `Insufficient stock. Available stock is ${product.stock}`
      );
    }

    // --------------------------------------------------
    // Calculate price
    // --------------------------------------------------

    const price = new Prisma.Decimal(
      inputPrice !== undefined
        ? inputPrice
        : product.sellingPrice
    );

    if (price.lessThanOrEqualTo(0)) {
      throw new Error(
        "Product price must be greater than zero"
      );
    }

    const quantityDecimal = new Prisma.Decimal(quantity);
    const productTotalPrice = price.mul(quantityDecimal);

    const fixedDiscount = new Prisma.Decimal(
      discountValue || 0
    );

    const percentageDiscount = new Prisma.Decimal(
      discountPercent || 0
    );

    if (fixedDiscount.lessThan(0)) {
      throw new Error(
        "Discount value cannot be negative"
      );
    }

    if (
      percentageDiscount.lessThan(0) ||
      percentageDiscount.greaterThan(100)
    ) {
      throw new Error(
        "Discount percentage must be between 0 and 100"
      );
    }

    if (
      fixedDiscount.greaterThan(0) &&
      percentageDiscount.greaterThan(0)
    ) {
      throw new Error(
        "Use either discount value or discount percentage"
      );
    }

    // --------------------------------------------------
    // Calculate final price
    // --------------------------------------------------

    let totalPrice;
    let calculatedDiscountAmount;
    let finalPrice;

    if (invoice) {
      /*
       * Invoice already contains its own discount and total.
       * Do not apply payment discount again.
       */
      totalPrice = new Prisma.Decimal(
        invoice.totalAmount
      );

      calculatedDiscountAmount = new Prisma.Decimal(
        invoice.discountAmount
      );

      finalPrice = new Prisma.Decimal(
        invoice.dueAmount
      );
    } else {
      totalPrice = productTotalPrice;
      calculatedDiscountAmount = new Prisma.Decimal(0);

      if (percentageDiscount.greaterThan(0)) {
        calculatedDiscountAmount = totalPrice
          .mul(percentageDiscount)
          .div(100);
      } else if (fixedDiscount.greaterThan(0)) {
        calculatedDiscountAmount = fixedDiscount;
      }

      if (
        calculatedDiscountAmount.greaterThan(totalPrice)
      ) {
        throw new Error(
          "Discount amount cannot exceed total price"
        );
      }

      finalPrice = totalPrice.minus(
        calculatedDiscountAmount
      );
    }

    if (finalPrice.lessThan(0)) {
      throw new Error(
        "Final price cannot be negative"
      );
    }

    // --------------------------------------------------
    // Validate payment amount
    // --------------------------------------------------

    const paidAmount = new Prisma.Decimal(amount);

    if (paidAmount.lessThan(0)) {
      throw new Error(
        "Payment amount cannot be negative"
      );
    }

    if (paidAmount.greaterThan(finalPrice)) {
      throw new Error(
        `Payment amount cannot exceed final price ${finalPrice.toFixed(
          2
        )}`
      );
    }

    const paymentStatus = calculatePaymentStatus(
      paidAmount,
      finalPrice
    );

    // --------------------------------------------------
    // Generate payment number
    // --------------------------------------------------

    const paymentNumber =
      await getUniquePaymentNumber(tx);

    // --------------------------------------------------
    // Create payment
    // --------------------------------------------------

    const payment = await tx.payment.create({
      data: {
        paymentNumber,

        userId: loggedInUserId,
        productId,

        customerName,
        quantity,

        price,
        totalPrice,

        /*
         * For invoice payment, invoice discount is stored.
         * For direct payment, request discount is stored.
         */
        discountValue: invoice
          ? new Prisma.Decimal(0)
          : fixedDiscount,

        discountPercent: invoice
          ? new Prisma.Decimal(0)
          : percentageDiscount,

        discountAmount: calculatedDiscountAmount,

        finalPrice,

        paymentMethod,
        amount: paidAmount,
        currency,
        paymentStatus,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },

        product: {
          select: {
            id: true,
            productName: true,
            productImage: true,
            stock: true,
            sellingPrice: true,
          },
        },
      },
    });

    // --------------------------------------------------
    // Update invoice
    // --------------------------------------------------

    let updatedInvoice = null;

    if (invoice) {
      const invoiceTotal = new Prisma.Decimal(
        invoice.totalAmount
      );

      const existingPaidAmount = new Prisma.Decimal(
        invoice.paidAmount
      );

      const newPaidAmount =
        existingPaidAmount.plus(paidAmount);

      if (newPaidAmount.greaterThan(invoiceTotal)) {
        throw new Error(
          `Total paid amount cannot exceed invoice total ${invoiceTotal.toFixed(
            2
          )}`
        );
      }

      const newDueAmount =
        invoiceTotal.minus(newPaidAmount);

      const invoiceStatus = calculateInvoiceStatus(
        newPaidAmount,
        invoiceTotal
      );

      updatedInvoice = await tx.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          paymentId: payment.id,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: invoiceStatus,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payment: true,
          discounts: true,
          returns: true,
        },
      });
    }

    // --------------------------------------------------
    // Reduce stock for direct payment
    // --------------------------------------------------

    let updatedProduct = product;

    if (!invoiceId) {
      updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: {
            decrement: quantity,
          },
          updatedBy: loggedInUserId,
        },
      });
    }

    // --------------------------------------------------
    // Audit
    // --------------------------------------------------

    await tx.audit.create({
      data: {
        action: "CREATE_PAYMENT",
        table: "Payment",

        oldValue: Prisma.JsonNull,

        newValue: makeJsonSafe({
          paymentId: payment.id,
          paymentNumber: payment.paymentNumber,
          invoiceId: invoiceId || null,
          productId,
          customerName,
          quantity,
          totalPrice,
          discountAmount: calculatedDiscountAmount,
          finalPrice,
          amount: paidAmount,
          paymentMethod,
          paymentStatus,
        }),

        createdBy: loggedInUserId,
        userId: loggedInUserId,
      },
    });

    return {
      payment,
      invoice: updatedInvoice,
      product: updatedProduct,
    };
  });
};

// ======================================================
// GET ALL PAYMENTS
// ======================================================

export const getAllPaymentsService = async ({
  search,
  paymentStatus,
  paymentMethod,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}) => {
  const currentPage = Number(page);
  const pageLimit = Number(limit);

  if (
    !Number.isInteger(currentPage) ||
    currentPage <= 0
  ) {
    throw new Error(
      "Page must be a positive integer"
    );
  }

  if (
    !Number.isInteger(pageLimit) ||
    pageLimit <= 0 ||
    pageLimit > 100
  ) {
    throw new Error(
      "Limit must be between 1 and 100"
    );
  }

  const skip = (currentPage - 1) * pageLimit;

  const where = {};

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  if (search) {
    where.OR = [
      {
        paymentNumber: {
          contains: search,
        },
      },
      {
        customerName: {
          contains: search,
        },
      },
      {
        product: {
          productName: {
            contains: search,
          },
        },
      },
      {
        user: {
          fullName: {
            contains: search,
          },
        },
      },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      const parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        throw new Error("Invalid startDate");
      }

      parsedStartDate.setHours(0, 0, 0, 0);
      where.createdAt.gte = parsedStartDate;
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        throw new Error("Invalid endDate");
      }

      parsedEndDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = parsedEndDate;
    }
  }

  const [payments, totalRecords, totals] =
    await Promise.all([
      prisma.payment.findMany({
        where,

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },

          product: {
            select: {
              id: true,
              productName: true,
              productImage: true,
              stock: true,
              sellingPrice: true,
            },
          },

          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              customerName: true,
              totalAmount: true,
              paidAmount: true,
              dueAmount: true,
              status: true,
              createdAt: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: pageLimit,
      }),

      prisma.payment.count({
        where,
      }),

      prisma.payment.aggregate({
        where,
        _sum: {
          amount: true,
          finalPrice: true,
          discountAmount: true,
        },
      }),
    ]);

  return {
    payments,

    summary: {
      totalPaymentAmount:
        totals._sum.amount ?? new Prisma.Decimal(0),

      totalFinalPrice:
        totals._sum.finalPrice ??
        new Prisma.Decimal(0),

      totalDiscountAmount:
        totals._sum.discountAmount ??
        new Prisma.Decimal(0),
    },

    pagination: {
      currentPage,
      limit: pageLimit,
      totalRecords,
      totalPages: Math.ceil(
        totalRecords / pageLimit
      ),
    },
  };
};

// ======================================================
// GET PAYMENT BY ID
// ======================================================

export const getPaymentByIdService = async (
  paymentId
) => {
  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },

      product: true,

      invoice: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
          discounts: true,
          returns: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

// ======================================================
// GET PAYMENT BY NUMBER
// ======================================================

export const getPaymentByNumberService = async (
  paymentNumber
) => {
  if (!paymentNumber) {
    throw new Error(
      "Payment number is required"
    );
  }

  const payment = await prisma.payment.findUnique({
    where: {
      paymentNumber,
    },

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },

      product: true,

      invoice: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
          discounts: true,
          returns: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

// ======================================================
// UPDATE PAYMENT STATUS
// ======================================================

export const updatePaymentStatusService = async (
  paymentId,
  input,
  loggedInUserId
) => {
  const { paymentStatus, remarks } = input;

  return prisma.$transaction(async (tx) => {
    const existingPayment =
      await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: {
          invoice: true,
        },
      });

    if (!existingPayment) {
      throw new Error("Payment not found");
    }

    if (
      existingPayment.paymentStatus === "REFUNDED"
    ) {
      throw new Error(
        "Refunded payment status cannot be changed"
      );
    }

    if (paymentStatus === "REFUNDED") {
      throw new Error(
        "Use the refund API to refund a payment"
      );
    }

    const paymentAmount = new Prisma.Decimal(
      existingPayment.amount
    );

    const finalPrice = new Prisma.Decimal(
      existingPayment.finalPrice
    );

    const calculatedStatus =
      calculatePaymentStatus(
        paymentAmount,
        finalPrice
      );

    /*
     * Prevent manual incorrect status changes.
     */
    if (paymentStatus !== calculatedStatus) {
      throw new Error(
        `Payment status must be ${calculatedStatus} according to the payment amount`
      );
    }

    const updatedPayment =
      await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          paymentStatus: calculatedStatus,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          product: true,
          invoice: true,
        },
      });

    if (existingPayment.invoice) {
      const invoicePaidAmount =
        new Prisma.Decimal(
          existingPayment.invoice.paidAmount
        );

      const invoiceTotalAmount =
        new Prisma.Decimal(
          existingPayment.invoice.totalAmount
        );

      const invoiceStatus =
        calculateInvoiceStatus(
          invoicePaidAmount,
          invoiceTotalAmount
        );

      await tx.invoice.update({
        where: {
          id: existingPayment.invoice.id,
        },
        data: {
          status: invoiceStatus,
        },
      });
    }

    await tx.audit.create({
      data: {
        action: "UPDATE_PAYMENT_STATUS",
        table: "Payment",

        oldValue: makeJsonSafe({
          paymentStatus:
            existingPayment.paymentStatus,
        }),

        newValue: makeJsonSafe({
          paymentStatus: calculatedStatus,
          remarks: remarks || null,
        }),

        createdBy: loggedInUserId,
        userId: loggedInUserId,
      },
    });

    return updatedPayment;
  });
};

// ======================================================
// REFUND PAYMENT
// ======================================================

export const refundPaymentService = async (
  paymentId,
  input,
  loggedInUserId
) => {
  const { refundAmount, remarks } = input;

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        invoice: true,
        product: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.paymentStatus === "REFUNDED") {
      throw new Error(
        "Payment has already been refunded"
      );
    }

    const decimalRefundAmount =
      new Prisma.Decimal(refundAmount);

    const paymentAmount =
      new Prisma.Decimal(payment.amount);

    if (decimalRefundAmount.lessThanOrEqualTo(0)) {
      throw new Error(
        "Refund amount must be greater than zero"
      );
    }

    /*
     * Current schema and PaymentStatus enum do not
     * support partial refund status.
     */
    if (!decimalRefundAmount.equals(paymentAmount)) {
      throw new Error(
        "Only full payment refund is supported. Refund amount must equal payment amount"
      );
    }

    const updatedPayment =
      await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          paymentStatus: "REFUNDED",
        },
        include: {
          product: true,
          invoice: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

    /*
     * Current schema has one payment per invoice.
     * Therefore the complete invoice payment is reversed.
     */
    if (payment.invoice) {
      await tx.invoice.update({
        where: {
          id: payment.invoice.id,
        },
        data: {
          paidAmount: new Prisma.Decimal(0),
          dueAmount:
            payment.invoice.totalAmount,
          status: "REFUNDED",
        },
      });
    } else {
      /*
       * Direct payment reduced stock during creation,
       * therefore restore stock during refund.
       */
      await tx.product.update({
        where: {
          id: payment.productId,
        },
        data: {
          stock: {
            increment: payment.quantity,
          },
          updatedBy: loggedInUserId,
        },
      });
    }

    await tx.audit.create({
      data: {
        action: "REFUND_PAYMENT",
        table: "Payment",

        oldValue: makeJsonSafe({
          paymentStatus:
            payment.paymentStatus,
          amount: payment.amount,
        }),

        newValue: makeJsonSafe({
          paymentStatus: "REFUNDED",
          refundAmount:
            decimalRefundAmount,
          remarks: remarks || null,
        }),

        createdBy: loggedInUserId,
        userId: loggedInUserId,
      },
    });

    return updatedPayment;
  });
};

// ======================================================
// PAYMENT STATISTICS
// ======================================================

export const getPaymentStatsService = async () => {
  const [
    totalPayments,
    paidPayments,
    pendingPayments,
    partialPayments,
    refundedPayments,
    paymentAmountSummary,
    methodGroups,
  ] = await Promise.all([
    prisma.payment.count(),

    prisma.payment.count({
      where: {
        paymentStatus: "PAID",
      },
    }),

    prisma.payment.count({
      where: {
        paymentStatus: "PENDING",
      },
    }),

    prisma.payment.count({
      where: {
        paymentStatus: "PARTIAL",
      },
    }),

    prisma.payment.count({
      where: {
        paymentStatus: "REFUNDED",
      },
    }),

    prisma.payment.aggregate({
      where: {
        paymentStatus: {
          in: ["PAID", "PARTIAL"],
        },
      },
      _sum: {
        amount: true,
        finalPrice: true,
        discountAmount: true,
      },
    }),

    prisma.payment.groupBy({
      by: ["paymentMethod"],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    totalPayments,
    paidPayments,
    pendingPayments,
    partialPayments,
    refundedPayments,

    totalCollectedAmount:
      paymentAmountSummary._sum.amount ??
      new Prisma.Decimal(0),

    totalFinalPrice:
      paymentAmountSummary._sum.finalPrice ??
      new Prisma.Decimal(0),

    totalDiscountAmount:
      paymentAmountSummary._sum
        .discountAmount ??
      new Prisma.Decimal(0),

    paymentMethods: methodGroups.map(
      (group) => ({
        paymentMethod: group.paymentMethod,
        count: group._count.id,
        totalAmount:
          group._sum.amount ??
          new Prisma.Decimal(0),
      })
    ),
  };
};