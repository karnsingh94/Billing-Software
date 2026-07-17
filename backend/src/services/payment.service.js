import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";

// ======================================================
// HELPERS
// ======================================================

const makeJsonSafe = (value) => {
  if (value === null || value === undefined) {
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

      if (typeof item === "bigint") {
        return item.toString();
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

    existingPayment =
      await tx.payment.findUnique({
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

const calculateDiscount = ({
  subtotal,
  discountType,
  discountValue,
}) => {
  const value = Number(discountValue || 0);

  if (value < 0) {
    throw new Error(
      "Discount cannot be negative"
    );
  }

  if (!discountType || value === 0) {
    return 0;
  }

  if (discountType === "PERCENTAGE") {
    if (value > 100) {
      throw new Error(
        "Percentage discount cannot exceed 100"
      );
    }

    return Number(
      ((subtotal * value) / 100).toFixed(2)
    );
  }

  if (discountType === "FIXED") {
    if (value > subtotal) {
      throw new Error(
        "Fixed discount cannot exceed subtotal"
      );
    }

    return Number(value.toFixed(2));
  }

  throw new Error(
    "Discount type must be PERCENTAGE or FIXED"
  );
};

// ======================================================
// CREATE PAYMENT
// ======================================================

export const createPaymentService = async (
  input,
  loggedInUserId
) => {
  const {
    customerName,
    paymentMethod,
    discountType,
    discountValue = 0,
    currency = "INR",
    products,
  } = input;

  if (!loggedInUserId) {
    throw new Error("Unauthorized user");
  }

  if (
    !Array.isArray(products) ||
    products.length === 0
  ) {
    throw new Error(
      "At least one product is required"
    );
  }

  return prisma.$transaction(async (tx) => {
    // Check user

    const user = await tx.user.findFirst({
      where: {
        id: loggedInUserId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error(
        "Logged-in user not found"
      );
    }

    // Validate duplicate product IDs

    const productIds = products.map(
      (item) => item.productId
    );

    const uniqueProductIds = [
      ...new Set(productIds),
    ];

    if (
      uniqueProductIds.length !==
      productIds.length
    ) {
      throw new Error(
        "The same product cannot be added twice"
      );
    }

    // Get products from database

    const databaseProducts =
      await tx.product.findMany({
        where: {
          id: {
            in: uniqueProductIds,
          },
          deletedAt: null,
        },
        select: {
          id: true,
          productName: true,
          productImage: true,
          productPrice: true,
          gst: true,
          sellingPrice: true,
          stock: true,
        },
      });

    if (
      databaseProducts.length !==
      uniqueProductIds.length
    ) {
      throw new Error(
        "One or more products were not found"
      );
    }

    let subtotal = 0;
    const paymentItems = [];

    for (const requestItem of products) {
      const quantity = Number(
        requestItem.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          "Quantity must be a positive integer"
        );
      }

      const product =
        databaseProducts.find(
          (databaseProduct) =>
            databaseProduct.id ===
            requestItem.productId
        );

      if (!product) {
        throw new Error(
          `Product not found: ${requestItem.productId}`
        );
      }

      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock for ${product.productName}. Available stock is ${product.stock}`
        );
      }

      const price = Number(
        product.sellingPrice
      );

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        throw new Error(
          `Invalid selling price for ${product.productName}`
        );
      }

      const totalPrice = Number(
        (price * quantity).toFixed(2)
      );

      subtotal += totalPrice;

      paymentItems.push({
        productId: product.id,
        quantity,
        price,
        totalPrice,
      });
    }

    subtotal = Number(
      subtotal.toFixed(2)
    );

    const discountAmount =
      calculateDiscount({
        subtotal,
        discountType,
        discountValue,
      });

    const finalAmount = Number(
      Math.max(
        subtotal - discountAmount,
        0
      ).toFixed(2)
    );

    /*
     * Your current requirement is complete payment.
     * So paidAmount automatically equals finalAmount.
     */
    const paidAmount = finalAmount;
    const dueAmount = 0;
    const status = "PAID";

    const paymentNumber =
      await getUniquePaymentNumber(tx);

    // Create payment and items

    const payment =
      await tx.payment.create({
        data: {
          paymentNumber,
          customerName:
            customerName || null,

          paymentMethod,
          currency,

          subtotal,

          discountType:
            discountType || null,

          discountValue:
            Number(discountValue || 0),

          discountAmount,

          finalAmount,
          paidAmount,
          dueAmount,
          status,

          userId: loggedInUserId,

          items: {
            create: paymentItems,
          },
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },

          items: {
            include: {
              product: {
                select: {
                  id: true,
                  productName: true,
                  productImage: true,
                  productPrice: true,
                  gst: true,
                  sellingPrice: true,
                  stock: true,
                },
              },
            },
          },
        },
      });

    // Reduce stock

    for (const item of paymentItems) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
          updatedBy:
            loggedInUserId,
        },
      });
    }

    // Audit log

    await tx.audit.create({
      data: {
        action: "CREATE_PAYMENT",
        table: "Payment",

        oldValue: Prisma.JsonNull,

        newValue: makeJsonSafe({
          id: payment.id,
          paymentNumber:
            payment.paymentNumber,
          customerName:
            payment.customerName,
          products: paymentItems,
          subtotal,
          discountType:
            discountType || null,
          discountValue:
            Number(discountValue || 0),
          discountAmount,
          finalAmount,
          paidAmount,
          dueAmount,
          status,
          paymentMethod,
        }),

        createdBy:
          loggedInUserId,
        userId:
          loggedInUserId,
      },
    });

    return payment;
  });
};

// ======================================================
// GET ALL PAYMENTS
// ======================================================

export const getAllPaymentsService = async ({
  search,
  status,
  paymentMethod,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}) => {
  const currentPage = Number(page);
  const pageLimit = Number(limit);

  const skip =
    (currentPage - 1) * pageLimit;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (paymentMethod) {
    where.paymentMethod =
      paymentMethod;
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
        user: {
          fullName: {
            contains: search,
          },
        },
      },
      {
        items: {
          some: {
            product: {
              productName: {
                contains: search,
              },
            },
          },
        },
      },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      const start =
        new Date(startDate);

      if (
        Number.isNaN(start.getTime())
      ) {
        throw new Error(
          "Invalid start date"
        );
      }

      start.setHours(0, 0, 0, 0);
      where.createdAt.gte = start;
    }

    if (endDate) {
      const end =
        new Date(endDate);

      if (
        Number.isNaN(end.getTime())
      ) {
        throw new Error(
          "Invalid end date"
        );
      }

      end.setHours(
        23,
        59,
        59,
        999
      );

      where.createdAt.lte = end;
    }
  }

  const [
    payments,
    totalRecords,
    totals,
  ] = await Promise.all([
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

        items: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                productImage: true,
                productPrice: true,
                gst: true,
                sellingPrice: true,
              },
            },
          },
        },

        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            paidAmount: true,
            dueAmount: true,
            status: true,
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
        subtotal: true,
        discountAmount: true,
        finalAmount: true,
        paidAmount: true,
        dueAmount: true,
      },
    }),
  ]);

  return {
    payments,

    summary: {
      totalSubtotal:
        totals._sum.subtotal || 0,

      totalDiscountAmount:
        totals._sum.discountAmount || 0,

      totalFinalAmount:
        totals._sum.finalAmount || 0,

      totalPaidAmount:
        totals._sum.paidAmount || 0,

      totalDueAmount:
        totals._sum.dueAmount || 0,
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
  const payment =
    await prisma.payment.findUnique({
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

        items: {
          include: {
            product: true,
          },
        },

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
    throw new Error(
      "Payment not found"
    );
  }

  return payment;
};

// ======================================================
// REFUND PAYMENT
// ======================================================

export const refundPaymentService = async (
  paymentId,
  input,
  loggedInUserId
) => {
  const { remarks } = input;

  return prisma.$transaction(
    async (tx) => {
      const payment =
        await tx.payment.findUnique({
          where: {
            id: paymentId,
          },

          include: {
            invoice: true,

            items: {
              include: {
                product: true,
              },
            },
          },
        });

      if (!payment) {
        throw new Error(
          "Payment not found"
        );
      }

      if (
        payment.status ===
        "REFUNDED"
      ) {
        throw new Error(
          "Payment is already refunded"
        );
      }

      const updatedPayment =
        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: "REFUNDED",
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

      // Restore product stock

      for (const item of payment.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment:
                item.quantity,
            },
            updatedBy:
              loggedInUserId,
          },
        });
      }

      if (payment.invoice) {
        await tx.invoice.update({
          where: {
            id: payment.invoice.id,
          },
          data: {
            status: "REFUNDED",
            paidAmount: 0,
            dueAmount:
              payment.invoice.totalAmount,
          },
        });
      }

      await tx.audit.create({
        data: {
          action:
            "REFUND_PAYMENT",
          table: "Payment",

          oldValue: makeJsonSafe({
            status:
              payment.status,
          }),

          newValue: makeJsonSafe({
            status: "REFUNDED",
            remarks:
              remarks || null,
          }),

          createdBy:
            loggedInUserId,
          userId:
            loggedInUserId,
        },
      });

      return updatedPayment;
    }
  );
};