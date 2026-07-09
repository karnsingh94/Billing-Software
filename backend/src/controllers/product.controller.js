import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/product.service.js";

export const createProductController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const productImage = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await createProductService(
      {
        productName: req.body.productName,
        stock: Number(req.body.stock || 0),
        sellingPrice: Number(req.body.sellingPrice),
        productImage,
      },
      userId
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const products = await getAllProductsService();

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const productImage = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.productImage;

    const product = await updateProductService(
      req.params.id,
      {
        productName: req.body.productName,
        stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
        sellingPrice:
          req.body.sellingPrice !== undefined
            ? Number(req.body.sellingPrice)
            : undefined,
        productImage,
      },
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    await deleteProductService(req.params.id, userId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};