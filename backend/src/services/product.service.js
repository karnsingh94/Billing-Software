import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";

// ======================================================
// HELPERS
// ======================================================

const calculateProductPrice = (productPrice, gst = 0) => {
  const price = Number(productPrice);
  const gstPercent = Number(gst);

  const gstAmount = Number(
    ((price * gstPercent) / 100).toFixed(2)
  );

  const sellingPrice = Number(
    (price + gstAmount).toFixed(2)
  );

  return {
    gstAmount,
    sellingPrice,
  };
};

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

const createAuditRecord = async ({
  tx,
  action,
  oldValue = null,
  newValue = null,
  userId,
}) => {
  return tx.audit.create({
    data: {
      action,
      table: "Product",

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

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProductService = async (
  data,
  userId
) => {
  if (!userId) {
    throw new Error("Unauthorized user");
  }

  const productPrice = Number(data.productPrice);
  const gst = Number(data.gst || 0);
  const stock = Number(data.stock || 0);

  const { gstAmount, sellingPrice } =
    calculateProductPrice(productPrice, gst);

  return prisma.$transaction(async (tx) => {
    const existingProduct =
      await tx.product.findFirst({
        where: {
          productName: data.productName.trim(),
          deletedAt: null,
        },
      });

    if (existingProduct) {
      throw new Error(
        "Product with this name already exists"
      );
    }

    const product = await tx.product.create({
      data: {
        productName: data.productName.trim(),
        productImage: data.productImage || null,

        stock,
        productPrice,
        gst,
        sellingPrice,

        userId,
        createdBy: userId,
      },
    });

    await createAuditRecord({
      tx,
      action: "CREATE_PRODUCT",
      oldValue: null,

      newValue: {
        ...product,
        gstAmount,
      },

      userId,
    });

    return {
      ...product,
      gstAmount,
    };
  });
};

// ======================================================
// GET ALL PRODUCTS
// ======================================================

export const getAllProductsService = async ({
  search,
  page = 1,
  limit = 10,
} = {}) => {
  const currentPage = Number(page);
  const pageLimit = Number(limit);
  const skip = (currentPage - 1) * pageLimit;

  const where = {
    deletedAt: null,
  };

  if (search) {
    where.productName = {
      contains: search.trim(),
    };
  }

  const [products, totalRecords] =
    await Promise.all([
      prisma.product.findMany({
        where,

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: pageLimit,
      }),

      prisma.product.count({
        where,
      }),
    ]);

  const productsWithGstAmount = products.map(
    (product) => {
      const { gstAmount } =
        calculateProductPrice(
          product.productPrice,
          product.gst
        );

      return {
        ...product,
        gstAmount,
      };
    }
  );

  const totalPages = Math.ceil(
    totalRecords / pageLimit
  );

  return {
    products: productsWithGstAmount,

    pagination: {
      currentPage,
      limit: pageLimit,
      totalRecords,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================

export const getProductByIdService = async (
  productId
) => {
  const product =
    await prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

  if (!product) {
    throw new Error("Product not found");
  }

  const { gstAmount } =
    calculateProductPrice(
      product.productPrice,
      product.gst
    );

  return {
    ...product,
    gstAmount,
  };
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProductService = async (
  productId,
  data,
  userId
) => {
  if (!userId) {
    throw new Error("Unauthorized user");
  }

  return prisma.$transaction(async (tx) => {
    const existingProduct =
      await tx.product.findFirst({
        where: {
          id: productId,
          deletedAt: null,
        },
      });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    const productPrice =
      data.productPrice !== undefined
        ? Number(data.productPrice)
        : Number(existingProduct.productPrice);

    const gst =
      data.gst !== undefined
        ? Number(data.gst)
        : Number(existingProduct.gst);

    const { gstAmount, sellingPrice } =
      calculateProductPrice(
        productPrice,
        gst
      );

    const updateData = {
      productPrice,
      gst,
      sellingPrice,
      updatedBy: userId,
    };

    if (data.productName !== undefined) {
      updateData.productName =
        data.productName.trim();
    }

    if (data.productImage !== undefined) {
      updateData.productImage =
        data.productImage;
    }

    if (data.stock !== undefined) {
      updateData.stock =
        Number(data.stock);
    }

    const updatedProduct =
      await tx.product.update({
        where: {
          id: productId,
        },

        data: updateData,
      });

    await createAuditRecord({
      tx,
      action: "UPDATE_PRODUCT",

      oldValue: existingProduct,

      newValue: {
        ...updatedProduct,
        gstAmount,
      },

      userId,
    });

    return {
      ...updatedProduct,
      gstAmount,
    };
  });
};

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProductService = async (
  productId,
  userId
) => {
  if (!userId) {
    throw new Error("Unauthorized user");
  }

  return prisma.$transaction(async (tx) => {
    const existingProduct =
      await tx.product.findFirst({
        where: {
          id: productId,
          deletedAt: null,
        },
      });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    await createAuditRecord({
      tx,
      action: "DELETE_PRODUCT",
      oldValue: existingProduct,

      newValue: {
        id: existingProduct.id,
        productName:
          existingProduct.productName,
        permanentlyDeleted: true,
        deletedBy: userId,
        deletedAt: new Date(),
      },

      userId,
    });

    const deletedProduct =
      await tx.product.delete({
        where: {
          id: productId,
        },
      });

    return {
      id: deletedProduct.id,
      productName:
        deletedProduct.productName,
    };
  });
};