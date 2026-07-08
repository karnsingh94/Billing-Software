import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/product.service.js";    

export const createProductController = async (req, res) => {
  try {
    const userId = req.user.id;

    const productImage = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await createProductService(
      {
        ...req.body,
        productImage,
      },
      userId
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const products = await getAllProductsService();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const userId = req.user.id;

    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    const product = await updateProductService(
      req.params.id,
      {
        ...req.body,
        productImage,
      },
      userId
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const userId = req.user.id;

    await deleteProductService(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};