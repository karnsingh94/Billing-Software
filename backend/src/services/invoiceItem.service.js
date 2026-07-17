import { Prisma } from "@prisma/client";
import prisma from "../db/db.js";

// ======================================================
// HELPERS
// ======================================================

const calculateItemTotal = (
  quantity,
  price,
  gst = 0
) => {
  const baseAmount =
    Number(quantity) * Number(price);

  const gstAmount =
    (baseAmount * Number(gst)) / 100;

  return baseAmount + gstAmount;
};

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

      if (typeof item === "bigint") {
        return item.toString();
      }

      return item;
    })
  );
};

const createAuditRecord = async ({
  tx,
  action,
  oldValue = null,
  newValue = null,
  userId,
}) => {
  if (!userId) {
    throw new Error(
      "User ID is required for audit record"
    );
  }

  return tx.audit.create({
    data: {
      action,
      table: "InvoiceItem",

      oldValue:
        oldValue === null
          ? Prisma.JsonNull
          : makeJsonSafe(oldValue),

      newValue:
        newValue === null
          ? Prisma.JsonNull
          : makeJsonSafe(newValue),

      userId,
      createdBy: userId,
    },
  });
};

const getInvoiceItemWithRelations = async (
  database,
  invoiceItemId
) => {
  return database.invoiceItem.findUnique({
    where: {
      id: invoiceItemId,
    },

    include: {
      invoice: true,
      product: true,
    },
  });
};

// ======================================================
// CREATE INVOICE ITEM
// ======================================================

export const createInvoiceItemService = async (
  input,
  loggedInUserId
) => {
  const {
    quantity,
    price,
    gst = 0,
    invoiceId,
    productId,
  } = input;

  return prisma.$transaction(async (tx) => {
    const loggedInUser =
      await tx.user.findFirst({
        where: {
          id: loggedInUserId,
          deletedAt: null,
        },

        select: {
          id: true,
        },
      });

    if (!loggedInUser) {
      throw new Error(
        "Logged-in user not found"
      );
    }

    const invoice =
      await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "CANCELLED") {
      throw new Error(
        "Cannot add item to cancelled invoice"
      );
    }

    if (invoice.status === "REFUNDED") {
      throw new Error(
        "Cannot add item to refunded invoice"
      );
    }

    const product =
      await tx.product.findFirst({
        where: {
          id: productId,
          deletedAt: null,
        },
      });

    if (!product) {
      throw new Error("Product not found");
    }

    const finalQuantity = Number(quantity);
    const finalPrice = Number(price);
    const finalGst = Number(gst || 0);

    const total = calculateItemTotal(
      finalQuantity,
      finalPrice,
      finalGst
    );

    const invoiceItem =
      await tx.invoiceItem.create({
        data: {
          quantity: finalQuantity,
          price: finalPrice,
          gst: finalGst,
          total,
          invoiceId,
          productId,
        },

        include: {
          invoice: true,
          product: true,
        },
      });

    await createAuditRecord({
      tx,
      action: "CREATE_INVOICE_ITEM",
      oldValue: null,

      newValue: {
        id: invoiceItem.id,
        invoiceId: invoiceItem.invoiceId,
        productId: invoiceItem.productId,
        quantity: invoiceItem.quantity,
        price: invoiceItem.price,
        gst: invoiceItem.gst,
        total: invoiceItem.total,
      },

      userId: loggedInUserId,
    });

    return invoiceItem;
  });
};

// ======================================================
// GET ALL INVOICE ITEMS
// ======================================================

export const getAllInvoiceItemsService = async ({
  search,
  invoiceId,
  productId,
  page = 1,
  limit = 10,
}) => {
  const currentPage = Number(page);
  const pageLimit = Number(limit);

  const skip =
    (currentPage - 1) * pageLimit;

  const where = {};

  if (invoiceId) {
    where.invoiceId = invoiceId;
  }

  if (productId) {
    where.productId = productId;
  }

  if (search) {
    where.OR = [
      {
        product: {
          productName: {
            contains: search,
          },
        },
      },

      {
        invoice: {
          invoiceNumber: {
            contains: search,
          },
        },
      },

      {
        invoice: {
          customerName: {
            contains: search,
          },
        },
      },
    ];
  }

  const [
    invoiceItems,
    totalRecords,
    totals,
  ] = await Promise.all([
    prisma.invoiceItem.findMany({
      where,

      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            customerName: true,
            status: true,
            totalAmount: true,
            createdAt: true,
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

      orderBy: {
        id: "desc",
      },

      skip,
      take: pageLimit,
    }),

    prisma.invoiceItem.count({
      where,
    }),

    prisma.invoiceItem.aggregate({
      where,

      _sum: {
        quantity: true,
        total: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(
    totalRecords / pageLimit
  );

  return {
    invoiceItems,

    summary: {
      totalQuantity:
        totals._sum.quantity || 0,

      totalAmount:
        Number(totals._sum.total || 0),
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
// GET INVOICE ITEM BY ID
// ======================================================

export const getInvoiceItemByIdService = async (
  invoiceItemId
) => {
  const invoiceItem =
    await getInvoiceItemWithRelations(
      prisma,
      invoiceItemId
    );

  if (!invoiceItem) {
    throw new Error(
      "Invoice item not found"
    );
  }

  return invoiceItem;
};

// ======================================================
// GET ITEMS BY INVOICE ID
// ======================================================

export const getInvoiceItemsByInvoiceIdService =
  async (invoiceId) => {
    const invoice =
      await prisma.invoice.findUnique({
        where: {
          id: invoiceId,
        },

        select: {
          id: true,
          invoiceNumber: true,
          customerName: true,
          status: true,
        },
      });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const invoiceItems =
      await prisma.invoiceItem.findMany({
        where: {
          invoiceId,
        },

        include: {
          product: true,
        },

        orderBy: {
          id: "desc",
        },
      });

    const summary =
      invoiceItems.reduce(
        (result, item) => {
          result.totalQuantity +=
            Number(item.quantity);

          result.totalAmount +=
            Number(item.total);

          return result;
        },
        {
          totalQuantity: 0,
          totalAmount: 0,
        }
      );

    return {
      invoice,
      invoiceItems,
      summary,
    };
  };

// ======================================================
// UPDATE INVOICE ITEM
// ======================================================

export const updateInvoiceItemService = async (
  invoiceItemId,
  input,
  loggedInUserId
) => {
  return prisma.$transaction(async (tx) => {
    const existingInvoiceItem =
      await getInvoiceItemWithRelations(
        tx,
        invoiceItemId
      );

    if (!existingInvoiceItem) {
      throw new Error(
        "Invoice item not found"
      );
    }

    if (
      existingInvoiceItem.invoice.status ===
      "CANCELLED"
    ) {
      throw new Error(
        "Cancelled invoice item cannot be updated"
      );
    }

    if (
      existingInvoiceItem.invoice.status ===
      "REFUNDED"
    ) {
      throw new Error(
        "Refunded invoice item cannot be updated"
      );
    }

    const finalInvoiceId =
      input.invoiceId ||
      existingInvoiceItem.invoiceId;

    const finalProductId =
      input.productId ||
      existingInvoiceItem.productId;

    const invoice =
      await tx.invoice.findUnique({
        where: {
          id: finalInvoiceId,
        },
      });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "CANCELLED") {
      throw new Error(
        "Cannot move item to cancelled invoice"
      );
    }

    if (invoice.status === "REFUNDED") {
      throw new Error(
        "Cannot move item to refunded invoice"
      );
    }

    const product =
      await tx.product.findFirst({
        where: {
          id: finalProductId,
          deletedAt: null,
        },
      });

    if (!product) {
      throw new Error("Product not found");
    }

    const finalQuantity =
      input.quantity !== undefined
        ? Number(input.quantity)
        : existingInvoiceItem.quantity;

    const finalPrice =
      input.price !== undefined
        ? Number(input.price)
        : Number(existingInvoiceItem.price);

    const finalGst =
      input.gst !== undefined
        ? Number(input.gst)
        : Number(existingInvoiceItem.gst);

    const total = calculateItemTotal(
      finalQuantity,
      finalPrice,
      finalGst
    );

    const updatedInvoiceItem =
      await tx.invoiceItem.update({
        where: {
          id: invoiceItemId,
        },

        data: {
          quantity: finalQuantity,
          price: finalPrice,
          gst: finalGst,
          total,
          invoiceId: finalInvoiceId,
          productId: finalProductId,
        },

        include: {
          invoice: true,
          product: true,
        },
      });

    await createAuditRecord({
      tx,
      action: "UPDATE_INVOICE_ITEM",

      oldValue: {
        id: existingInvoiceItem.id,
        invoiceId:
          existingInvoiceItem.invoiceId,
        productId:
          existingInvoiceItem.productId,
        quantity:
          existingInvoiceItem.quantity,
        price: existingInvoiceItem.price,
        gst: existingInvoiceItem.gst,
        total: existingInvoiceItem.total,
      },

      newValue: {
        id: updatedInvoiceItem.id,
        invoiceId:
          updatedInvoiceItem.invoiceId,
        productId:
          updatedInvoiceItem.productId,
        quantity:
          updatedInvoiceItem.quantity,
        price: updatedInvoiceItem.price,
        gst: updatedInvoiceItem.gst,
        total: updatedInvoiceItem.total,
      },

      userId: loggedInUserId,
    });

    return updatedInvoiceItem;
  });
};

// ======================================================
// DELETE INVOICE ITEM
// ======================================================

export const deleteInvoiceItemService = async (
  invoiceItemId,
  loggedInUserId
) => {
  return prisma.$transaction(async (tx) => {
    const existingInvoiceItem =
      await getInvoiceItemWithRelations(
        tx,
        invoiceItemId
      );

    if (!existingInvoiceItem) {
      throw new Error(
        "Invoice item not found"
      );
    }

    if (
      existingInvoiceItem.invoice.status ===
      "CANCELLED"
    ) {
      throw new Error(
        "Cancelled invoice item cannot be deleted"
      );
    }

    if (
      existingInvoiceItem.invoice.status ===
      "PAID"
    ) {
      throw new Error(
        "Paid invoice item cannot be deleted"
      );
    }

    if (
      existingInvoiceItem.invoice.status ===
      "REFUNDED"
    ) {
      throw new Error(
        "Refunded invoice item cannot be deleted"
      );
    }

    await tx.invoiceItem.delete({
      where: {
        id: invoiceItemId,
      },
    });

    await createAuditRecord({
      tx,
      action: "DELETE_INVOICE_ITEM",

      oldValue: {
        id: existingInvoiceItem.id,
        invoiceId:
          existingInvoiceItem.invoiceId,
        productId:
          existingInvoiceItem.productId,
        quantity:
          existingInvoiceItem.quantity,
        price: existingInvoiceItem.price,
        gst: existingInvoiceItem.gst,
        total: existingInvoiceItem.total,
      },

      newValue: null,

      userId: loggedInUserId,
    });

    return {
      id: existingInvoiceItem.id,

      invoiceId:
        existingInvoiceItem.invoiceId,

      productId:
        existingInvoiceItem.productId,
    };
  });
};