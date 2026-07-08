import prisma from "../config/prisma.js";

export const createProductService = async (data, userId) => {
  return await prisma.product.create({
    data: {
      productName: data.productName,
      productImage: data.productImage || null,
      stock: data.stock,
      sellingPrice: data.sellingPrice,
      userId,
      createdBy: userId,
    },
  });
};

export const getAllProductsService = async () => {
  return await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProductByIdService = async (id) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const updateProductService = async (id, data, userId) => {
  await getProductByIdService(id);

  return await prisma.product.update({
    where: { id },
    data: {
      productName: data.productName,
      productImage: data.productImage,
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
      sellingPrice: data.sellingPrice !== undefined ? Number(data.sellingPrice) : undefined,
      updatedBy: userId,
    },
  });
};

export const deleteProductService = async (id, userId) => {
  await getProductByIdService(id);

  return await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });
};