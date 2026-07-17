import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";


// ======================================================
// JSON SAFE
// ======================================================

const makeJsonSafe = (value) =>
  JSON.parse(
    JSON.stringify(
      value,
      (_, v) =>
        typeof v === "bigint"
          ? Number(v)
          : v
    )
  );

// ======================================================
// GENERATE INVOICE NUMBER
// ======================================================

const generateInvoiceNumber = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `INV-${year}${month}${day}-${random}`;
};

// ======================================================
// UNIQUE INVOICE NUMBER
// ======================================================

const getUniqueInvoiceNumber = async (
  tx
) => {
  let invoiceNumber;
  let exists;

  do {
    invoiceNumber =
      generateInvoiceNumber();

    exists =
      await tx.invoice.findUnique({
        where: {
          invoiceNumber,
        },
        select: {
          id: true,
        },
      });
  } while (exists);

  return invoiceNumber;
};
// ======================================================
// CREATE INVOICE
// ======================================================

export const createInvoiceService = async (
  input,
  loggedInUserId
) => {
  const {
    paymentId,
    customerName,
    currency = "INR",
  } = input;

  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  if (!loggedInUserId) {
    throw new Error("Unauthorized user");
  }

  return prisma.$transaction(async (tx) => {
    // ==========================================
    // 1. CHECK LOGGED-IN USER
    // ==========================================

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
      throw new Error(
        "Logged-in user not found"
      );
    }

    // ==========================================
    // 2. GET PAYMENT WITH MULTIPLE ITEMS
    // ==========================================

    const payment =
      await tx.payment.findUnique({
        where: {
          id: paymentId,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },

          invoice: true,
        },
      });

    if (!payment) {
      throw new Error(
        "Payment not found"
      );
    }

    // ==========================================
    // 3. CHECK EXISTING INVOICE
    // ==========================================

    if (payment.invoice) {
      throw new Error(
        "Invoice already exists for this payment"
      );
    }

    // ==========================================
    // 4. CHECK PAYMENT ITEMS
    // ==========================================

    if (
      !Array.isArray(payment.items) ||
      payment.items.length === 0
    ) {
      throw new Error(
        "No products found for this payment"
      );
    }

    for (const item of payment.items) {
      if (!item.product) {
        throw new Error(
          `Product not found for payment item ${item.id}`
        );
      }

      if (item.product.deletedAt) {
        throw new Error(
          `${item.product.productName} has been deleted`
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error(
          `Invalid quantity for ${item.product.productName}`
        );
      }

      const itemPrice = Number(
        item.price
      );

      const itemTotal = Number(
        item.totalPrice
      );

      if (
        !Number.isFinite(itemPrice) ||
        itemPrice <= 0
      ) {
        throw new Error(
          `Invalid price for ${item.product.productName}`
        );
      }

      if (
        !Number.isFinite(itemTotal) ||
        itemTotal < 0
      ) {
        throw new Error(
          `Invalid total price for ${item.product.productName}`
        );
      }
    }

    // ==========================================
    // 5. COPY PAYMENT TOTALS
    // ==========================================

    const subTotal =
      new Prisma.Decimal(
        payment.subtotal
      );

    const discountAmount =
      new Prisma.Decimal(
        payment.discountAmount || 0
      );

    const totalAmount =
      new Prisma.Decimal(
        payment.finalAmount
      );

    const paidAmount =
      new Prisma.Decimal(
        payment.paidAmount
      );

    const dueAmount =
      new Prisma.Decimal(
        payment.dueAmount
      );

    // ==========================================
    // 6. VALIDATE PAYMENT TOTALS
    // ==========================================

    if (subTotal.lessThan(0)) {
      throw new Error(
        "Payment subtotal cannot be negative"
      );
    }

    if (discountAmount.lessThan(0)) {
      throw new Error(
        "Payment discount cannot be negative"
      );
    }

    if (totalAmount.lessThan(0)) {
      throw new Error(
        "Payment final amount cannot be negative"
      );
    }

    if (paidAmount.lessThan(0)) {
      throw new Error(
        "Payment paid amount cannot be negative"
      );
    }

    if (dueAmount.lessThan(0)) {
      throw new Error(
        "Payment due amount cannot be negative"
      );
    }

    // ==========================================
    // 7. INVOICE STATUS
    // ==========================================

    let status = "PENDING";

    if (payment.status === "PAID") {
      status = "PAID";
    } else if (
      payment.status === "PARTIAL"
    ) {
      status = "PARTIAL";
    } else if (
      payment.status === "REFUNDED"
    ) {
      status = "REFUNDED";
    } else if (
      payment.status === "PENDING"
    ) {
      status = "PENDING";
    }

    // ==========================================
    // 8. GENERATE INVOICE NUMBER
    // ==========================================

    const invoiceNumber =
      await getUniqueInvoiceNumber(tx);

    // ==========================================
    // 9. PREPARE INVOICE ITEMS
    // ==========================================

    const invoiceItems =
      payment.items.map((item) => ({
        productId:
          item.productId,

        quantity:
          item.quantity,

        /*
         * PaymentItem.price contains
         * product selling price.
         */
        price:
          Number(item.price),

        /*
         * GST is copied from the Product table.
         * GST is not calculated again.
         */
        gst:
          Number(
            item.product.gst || 0
          ),

        /*
         * PaymentItem.totalPrice already contains:
         * price × quantity
         */
        total:
          Number(item.totalPrice),
      }));

    // ==========================================
    // 10. CREATE INVOICE
    // ==========================================

    const invoice =
      await tx.invoice.create({
        data: {
          invoiceNumber,

          paymentId:
            payment.id,

          userId:
            loggedInUserId,

          customerName:
            customerName ||
            payment.customerName ||
            "Customer",

          currency:
            currency ||
            payment.currency ||
            "INR",

          subTotal,
          discountAmount,
          totalAmount,
          paidAmount,
          dueAmount,
          status,

          items: {
            create:
              invoiceItems,
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
              product: true,
            },
          },

          discounts: true,
          payment: true,
          returns: true,
        },
      });

    // ==========================================
    // 11. CREATE AUDIT LOG
    // ==========================================

    await tx.audit.create({
      data: {
        action:
          "CREATE_INVOICE_FROM_PAYMENT",

        table:
          "Invoice",

        oldValue:
          Prisma.JsonNull,

        newValue:
          makeJsonSafe({
            invoiceId:
              invoice.id,

            invoiceNumber:
              invoice.invoiceNumber,

            paymentId:
              payment.id,

            customerName:
              invoice.customerName,

            currency:
              invoice.currency,

            products:
              payment.items.map(
                (item) => ({
                  paymentItemId:
                    item.id,

                  productId:
                    item.productId,

                  productName:
                    item.product
                      .productName,

                  quantity:
                    item.quantity,

                  price:
                    item.price,

                  gst:
                    item.product.gst,

                  totalPrice:
                    item.totalPrice,
                })
              ),

            subTotal,
            discountAmount,
            totalAmount,
            paidAmount,
            dueAmount,
            status,
          }),

        createdBy:
          loggedInUserId,

        userId:
          loggedInUserId,
      },
    });

    return invoice;
  });
};
// ======================================================
// GET ALL INVOICES
// ======================================================

export const getAllInvoicesService = async ({
  search,
  status,
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

  const skip =
    (currentPage - 1) * pageLimit;

  const where = {};

  // ==========================================
  // STATUS FILTER
  // ==========================================

  if (status) {
    where.status = status;
  }

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  if (search) {
    where.OR = [
      {
        invoiceNumber: {
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

  // ==========================================
  // DATE FILTER
  // ==========================================

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      const parsedStartDate =
        new Date(startDate);

      if (
        Number.isNaN(
          parsedStartDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid startDate"
        );
      }

      parsedStartDate.setHours(
        0,
        0,
        0,
        0
      );

      where.createdAt.gte =
        parsedStartDate;
    }

    if (endDate) {
      const parsedEndDate =
        new Date(endDate);

      if (
        Number.isNaN(
          parsedEndDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid endDate"
        );
      }

      parsedEndDate.setHours(
        23,
        59,
        59,
        999
      );

      where.createdAt.lte =
        parsedEndDate;
    }
  }

  // ==========================================
  // GET INVOICES, COUNT, AND TOTALS
  // ==========================================

  const [
    invoices,
    totalRecords,
    totals,
  ] = await Promise.all([
    prisma.invoice.findMany({
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
                stock: true,
              },
            },
          },
        },

        discounts: true,

        payment: {
          select: {
            id: true,
            paymentNumber: true,
            customerName: true,
            paymentMethod: true,
            currency: true,
            subtotal: true,
            discountAmount: true,
            finalAmount: true,
            paidAmount: true,
            dueAmount: true,
            status: true,
            createdAt: true,
          },
        },

        returns: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: pageLimit,
    }),

    prisma.invoice.count({
      where,
    }),

    prisma.invoice.aggregate({
      where,

      _sum: {
        subTotal: true,
        discountAmount: true,
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(
    totalRecords / pageLimit
  );

  return {
    invoices,

    summary: {
      subTotal:
        totals._sum.subTotal ??
        new Prisma.Decimal(0),

      discountAmount:
        totals._sum.discountAmount ??
        new Prisma.Decimal(0),

      totalAmount:
        totals._sum.totalAmount ??
        new Prisma.Decimal(0),

      paidAmount:
        totals._sum.paidAmount ??
        new Prisma.Decimal(0),

      dueAmount:
        totals._sum.dueAmount ??
        new Prisma.Decimal(0),
    },

    pagination: {
      currentPage,
      limit: pageLimit,
      totalRecords,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};

// ======================================================
// GET INVOICE BY ID
// ======================================================

export const getInvoiceByIdService = async (
  invoiceId
) => {
  if (!invoiceId) {
    throw new Error(
      "Invoice ID is required"
    );
  }

  const invoice =
    await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            location: true,
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

        discounts: true,

        payment: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },

        returns: true,
      },
    });

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  return invoice;
};

// ======================================================
// GET INVOICE BY NUMBER
// ======================================================

export const getInvoiceByNumberService = async (
  invoiceNumber
) => {
  if (!invoiceNumber) {
    throw new Error(
      "Invoice number is required"
    );
  }

  const invoice =
    await prisma.invoice.findUnique({
      where: {
        invoiceNumber,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            location: true,
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

        discounts: true,

        payment: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },

        returns: true,
      },
    });

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  return invoice;
};
// ======================================================
// UPDATE INVOICE BASIC DETAILS
// ======================================================

export const updateInvoiceService = async (
  invoiceId,
  input,
  loggedInUserId
) => {
  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }

  if (!loggedInUserId) {
    throw new Error("Unauthorized user");
  }

  return prisma.$transaction(async (tx) => {
    const existingInvoice =
      await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

    if (!existingInvoice) {
      throw new Error("Invoice not found");
    }

    if (existingInvoice.status === "CANCELLED") {
      throw new Error(
        "Cancelled invoice cannot be updated"
      );
    }

    if (existingInvoice.status === "REFUNDED") {
      throw new Error(
        "Refunded invoice cannot be updated"
      );
    }

    const updateData = {};

    if (input.customerName !== undefined) {
      updateData.customerName =
        input.customerName;
    }

    if (input.currency !== undefined) {
      updateData.currency =
        input.currency;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error(
        "At least one field is required for update"
      );
    }

    const updatedInvoice =
      await tx.invoice.update({
        where: {
          id: invoiceId,
        },

        data: updateData,

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
              product: true,
            },
          },

          discounts: true,

          payment: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },

          returns: true,
        },
      });

    await tx.audit.create({
      data: {
        action: "UPDATE_INVOICE",
        table: "Invoice",

        oldValue: makeJsonSafe({
          customerName:
            existingInvoice.customerName,

          currency:
            existingInvoice.currency,
        }),

        newValue: makeJsonSafe({
          customerName:
            updatedInvoice.customerName,

          currency:
            updatedInvoice.currency,
        }),

        createdBy:
          loggedInUserId,

        userId:
          loggedInUserId,
      },
    });

    return updatedInvoice;
  });
};

// ======================================================
// CANCEL INVOICE
// ======================================================

export const cancelInvoiceService = async (
  invoiceId,
  input,
  loggedInUserId
) => {
  const { remarks } = input;

  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }

  if (!loggedInUserId) {
    throw new Error("Unauthorized user");
  }

  return prisma.$transaction(async (tx) => {
    const invoice =
      await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },

          payment: true,
        },
      });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "CANCELLED") {
      throw new Error(
        "Invoice is already cancelled"
      );
    }

    if (invoice.status === "REFUNDED") {
      throw new Error(
        "Refunded invoice cannot be cancelled"
      );
    }

    if (invoice.status === "PAID") {
      throw new Error(
        "Paid invoice cannot be cancelled"
      );
    }

    if (invoice.payment) {
      throw new Error(
        "Invoice linked with payment cannot be cancelled"
      );
    }

    /*
     * Restore stock only when this invoice reduced stock.
     * In your current flow, stock is reduced while creating
     * the payment, so do not restore stock here for invoices
     * created from a payment.
     */

    const cancelledInvoice =
      await tx.invoice.update({
        where: {
          id: invoiceId,
        },

        data: {
          status: "CANCELLED",
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
              product: true,
            },
          },

          discounts: true,

          payment: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },

          returns: true,
        },
      });

    await tx.audit.create({
      data: {
        action: "CANCEL_INVOICE",
        table: "Invoice",

        oldValue: makeJsonSafe({
          status: invoice.status,
        }),

        newValue: makeJsonSafe({
          status: "CANCELLED",
          remarks: remarks || null,
        }),

        createdBy:
          loggedInUserId,

        userId:
          loggedInUserId,
      },
    });

    return cancelledInvoice;
  });
};

// ======================================================
// INVOICE STATISTICS
// ======================================================

export const getInvoiceStatsService =
  async () => {
    const [
      totalInvoices,
      pendingInvoices,
      partialInvoices,
      paidInvoices,
      cancelledInvoices,
      refundedInvoices,
      totals,
    ] = await Promise.all([
      prisma.invoice.count(),

      prisma.invoice.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.invoice.count({
        where: {
          status: "PARTIAL",
        },
      }),

      prisma.invoice.count({
        where: {
          status: "PAID",
        },
      }),

      prisma.invoice.count({
        where: {
          status: "CANCELLED",
        },
      }),

      prisma.invoice.count({
        where: {
          status: "REFUNDED",
        },
      }),

      prisma.invoice.aggregate({
        where: {
          status: {
            not: "CANCELLED",
          },
        },

        _sum: {
          subTotal: true,
          discountAmount: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
        },
      }),
    ]);

    return {
      totalInvoices,
      pendingInvoices,
      partialInvoices,
      paidInvoices,
      cancelledInvoices,
      refundedInvoices,

      subTotal:
        totals._sum.subTotal ??
        new Prisma.Decimal(0),

      discountAmount:
        totals._sum.discountAmount ??
        new Prisma.Decimal(0),

      totalAmount:
        totals._sum.totalAmount ??
        new Prisma.Decimal(0),

      paidAmount:
        totals._sum.paidAmount ??
        new Prisma.Decimal(0),

      dueAmount:
        totals._sum.dueAmount ??
        new Prisma.Decimal(0),
    };
  };