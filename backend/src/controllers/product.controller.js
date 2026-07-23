import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/product.service.js";

const getErrorStatusCode = (message = "") => {
  const text = String(message).toLowerCase();

  if (text.includes("unauthorized")) {
    return 401;
  }

  if (text.includes("not found")) {
    return 404;
  }

  if (
    text.includes("required") ||
    text.includes("invalid") ||
    text.includes("already") ||
    text.includes("must") ||
    text.includes("cannot")
  ) {
    return 400;
  }

  return 500;
};

const sendErrorResponse = (
  res,
  error,
  fallbackMessage
) => {
  console.error("PRODUCT API ERROR:", error);

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return res
    .status(getErrorStatusCode(message))
    .json({
      success: false,
      message: message || fallbackMessage,
    });
};

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProductController = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const productImage = req.file


    const product =
      await createProductService(
        {
          productName:
            req.body.productName,

          productPrice:
            Number(
              req.body.productPrice
            ),

          gst:
            req.body.gst !== undefined
              ? Number(req.body.gst)
              : 0,

          stock:
            req.body.stock !== undefined
              ? Number(req.body.stock)
              : 0,

          productImage:productImage.path.replace(/\\/g, "/")
  ,
        },
        userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      data: product,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to create product"
    );
  }
};

// ======================================================
// GET ALL PRODUCTS
// ======================================================

export const getAllProductsController = async (
  req,
  res
) => {
  try {
    const result =
      await getAllProductsService(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Products fetched successfully",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch products"
    );
  }
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================

export const getProductByIdController = async (
  req,
  res
) => {
  try {
    const product =
      await getProductByIdService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch product"
    );
  }
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProductController = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;
    const productImage = req.file

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const updateData = {};

    if (req.body.productName !== undefined) {
      updateData.productName =
        req.body.productName;
    }

    if (
      req.body.productPrice !== undefined
    ) {
      updateData.productPrice =
        Number(
          req.body.productPrice
        );
    }

    if (req.body.gst !== undefined) {
      updateData.gst =
        Number(req.body.gst);
    }

    if (req.body.stock !== undefined) {
      updateData.stock =
        Number(req.body.stock);
    }

    if (productImage) {
      updateData.productImage = productImage.path.replace(/\\/g, "/")
  
    } else if (
      req.body.productImage !== undefined
    ) {
      updateData.productImage =
        req.body.productImage;
    }

    const product =
      await updateProductService(
        req.params.id,
        updateData,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update product"
    );
  }
};

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProductController = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const result =
      await deleteProductService(
        req.params.id,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to delete product"
    );
  }
};