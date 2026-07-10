import { Prisma } from "@prisma/client";
import prisma from "../db/db.js";

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

const generateInvoiceNumber = () => {
  const date = new Date();

  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `INV-${datePart}-${randomNumber}`;
};

const getUniqueInvoiceNumber = async (tx) => {
  let invoiceNumber;
  let existingInvoice;

  do {
    invoiceNumber = generateInvoiceNumber();

    existingInvoice = await tx.invoice.findUnique({
      where: {
        invoiceNumber,
      },
      select: {
        id: true,
      },
    });
  } while (existingInvoice);

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
    customerName,
    currency = "INR",
    items,
    discount,
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

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(
        "At least one invoice item is required"
      );
    }

    // --------------------------------------------------
    // Prevent same product multiple times
    // --------------------------------------------------

    const productIds = items.map(
      (item) => item.productId
    );

    const uniqueProductIds = new Set(productIds);

    if (
      uniqueProductIds.size !== productIds.length
    ) {
      throw new Error(
        "Same product cannot be added multiple times"
      );
    }

    // --------------------------------------------------
    // Fetch products
    // --------------------------------------------------

    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        deletedAt: null,
      },
    });

    if (products.length !== productIds.length) {
      throw new Error(
        "One or more products were not found"
      );
    }

    // --------------------------------------------------
    // Calculate invoice items
    // --------------------------------------------------

    const calculatedItems = [];
    let subTotal = new Prisma.Decimal(0);

    for (const item of items) {
      const product = products.find(
        (productItem) =>
          productItem.id === item.productId
      );

      if (!product) {
        throw new Error(
          `Product not found: ${item.productId}`
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error(
          `Invalid quantity for ${product.productName}`
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.productName}. Available stock is ${product.stock}`
        );
      }

      const price = new Prisma.Decimal(
        item.price !== undefined
          ? item.price
          : product.sellingPrice
      );

      if (price.lessThanOrEqualTo(0)) {
        throw new Error(
          `Price must be greater than zero for ${product.productName}`
        );
      }

      const gst = new Prisma.Decimal(
        item.gst || 0
      );

      if (
        gst.lessThan(0) ||
        gst.greaterThan(100)
      ) {
        throw new Error(
          `GST must be between 0 and 100 for ${product.productName}`
        );
      }

      const quantity = new Prisma.Decimal(
        item.quantity
      );

      const baseTotal = price.mul(quantity);

      const gstAmount = baseTotal
        .mul(gst)
        .div(100);

      const itemTotal =
        baseTotal.plus(gstAmount);

      subTotal = subTotal.plus(itemTotal);

      calculatedItems.push({
        productId: product.id,
        productName: product.productName,
        quantity: item.quantity,
        price: price.toNumber(),
        gst: gst.toNumber(),
        total: itemTotal.toNumber(),
      });
    }

    // --------------------------------------------------
    // Calculate discount
    // --------------------------------------------------

    let discountAmount = new Prisma.Decimal(0);

    if (discount) {
      const discountValue =
        new Prisma.Decimal(
          discount.discountValue || 0
        );

      if (discountValue.lessThan(0)) {
        throw new Error(
          "Discount value cannot be negative"
        );
      }

      if (
        discount.discountType === "PERCENTAGE"
      ) {
        if (discountValue.greaterThan(100)) {
          throw new Error(
            "Percentage discount cannot exceed 100"
          );
        }

        discountAmount = subTotal
          .mul(discountValue)
          .div(100);
      } else if (
        discount.discountType === "FIXED"
      ) {
        discountAmount = discountValue;
      }

      if (
        discountAmount.greaterThan(subTotal)
      ) {
        throw new Error(
          "Discount amount cannot exceed subtotal"
        );
      }
    }

    // --------------------------------------------------
    // Invoice totals
    // --------------------------------------------------

    const totalAmount =
      subTotal.minus(discountAmount);

    const paidAmount = new Prisma.Decimal(0);
    const dueAmount = totalAmount;

    const invoiceNumber =
      await getUniqueInvoiceNumber(tx);

    // --------------------------------------------------
    // Create invoice
    // --------------------------------------------------

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,

        userId: loggedInUserId,

        customerName,
        currency,

        subTotal,
        discountAmount,
        totalAmount,
        paidAmount,
        dueAmount,

        status: "PENDING",

        items: {
          create: calculatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            gst: item.gst,
            total: item.total,
          })),
        },

        ...(discount
          ? {
              discounts: {
                create: {
                  discountType:
                    discount.discountType,

                  discountValue:
                    Number(
                      discount.discountValue
                    ),

                  discountAmount:
                    discountAmount.toNumber(),
                },
              },
            }
          : {}),
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

    // --------------------------------------------------
    // Reduce product stock
    // --------------------------------------------------

    for (const item of calculatedItems) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
          updatedBy: loggedInUserId,
        },
      });
    }

    // --------------------------------------------------
    // Audit log
    // --------------------------------------------------

    await tx.audit.create({
      data: {
        action: "CREATE_INVOICE",
        table: "Invoice",

        oldValue: Prisma.JsonNull,

        newValue: makeJsonSafe({
          invoiceId: invoice.id,
          invoiceNumber:
            invoice.invoiceNumber,
          customerName:
            invoice.customerName,
          items: calculatedItems,
          subTotal,
          discountAmount,
          totalAmount,
          paidAmount,
          dueAmount,
          status: invoice.status,
        }),

        createdBy: loggedInUserId,
        userId: loggedInUserId,
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

  const skip = (currentPage - 1) * pageLimit;

  const where = {};

  if (status) {
    where.status = status;
  }

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
    ];
  }

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
        throw new Error("Invalid endDate");
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
                stock: true,
                sellingPrice: true,
              },
            },
          },
        },

        discounts: true,

        payment: {
          select: {
            id: true,
            paymentNumber: true,
            amount: true,
            paymentMethod: true,
            paymentStatus: true,
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
      totalPages: Math.ceil(
        totalRecords / pageLimit
      ),
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
            product: true,
          },
        },

        discounts: true,
        payment: true,
        returns: true,
      },
    });

  if (!invoice) {
    throw new Error("Invoice not found");
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
            product: true,
          },
        },

        discounts: true,
        payment: true,
        returns: true,
      },
    });

  if (!invoice) {
    throw new Error("Invoice not found");
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
  const existingInvoice =
    await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    });

  if (!existingInvoice) {
    throw new Error("Invoice not found");
  }

  if (
    existingInvoice.status ===
    "CANCELLED"
  ) {
    throw new Error(
      "Cancelled invoice cannot be updated"
    );
  }

  if (
    existingInvoice.status ===
    "REFUNDED"
  ) {
    throw new Error(
      "Refunded invoice cannot be updated"
    );
  }

  const updatedInvoice =
    await prisma.$transaction(
      async (tx) => {
        const invoice =
          await tx.invoice.update({
            where: {
              id: invoiceId,
            },

            data: {
              ...(input.customerName !==
              undefined
                ? {
                    customerName:
                      input.customerName,
                  }
                : {}),

              ...(input.currency !==
              undefined
                ? {
                    currency:
                      input.currency,
                  }
                : {}),
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
                invoice.customerName,
              currency:
                invoice.currency,
            }),

            createdBy:
              loggedInUserId,

            userId:
              loggedInUserId,
          },
        });

        return invoice;
      }
    );

  return updatedInvoice;
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

  return prisma.$transaction(async (tx) => {
    const invoice =
      await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },

        include: {
          items: true,
          payment: true,
        },
      });

    if (!invoice) {
      throw new Error(
        "Invoice not found"
      );
    }

    if (
      invoice.status === "CANCELLED"
    ) {
      throw new Error(
        "Invoice is already cancelled"
      );
    }

    if (invoice.status === "PAID") {
      throw new Error(
        "Paid invoice cannot be cancelled"
      );
    }

    if (
      invoice.status === "REFUNDED"
    ) {
      throw new Error(
        "Refunded invoice cannot be cancelled"
      );
    }

    if (invoice.payment) {
      throw new Error(
        "Invoice with payment cannot be cancelled"
      );
    }

    // Restore stock
    for (const item of invoice.items) {
      await tx.product.update({
        where: {
          id: item.productId,
        },

        data: {
          stock: {
            increment: item.quantity,
          },

          updatedBy:
            loggedInUserId,
        },
      });
    }

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
          payment: true,
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

        createdBy: loggedInUserId,
        userId: loggedInUserId,
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
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          discountAmount: true,
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

      totalAmount:
        totals._sum.totalAmount ??
        new Prisma.Decimal(0),

      paidAmount:
        totals._sum.paidAmount ??
        new Prisma.Decimal(0),

      dueAmount:
        totals._sum.dueAmount ??
        new Prisma.Decimal(0),

      discountAmount:
        totals._sum.discountAmount ??
        new Prisma.Decimal(0),
    };
  };