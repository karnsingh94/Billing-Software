import  prisma  from "../db/db.js";

// helper function -> total calculate
const calculateItemTotal = (quantity, price, gst = 0) => {
  const baseAmount = Number(quantity) * Number(price);
  const gstAmount = (baseAmount * Number(gst)) / 100;
  return baseAmount + gstAmount;
};



// ================= CREATE INVOICE ITEM =================
export const createInvoiceItem = async (req, res) => {
  try {
    const { quantity, price, gst, invoiceId, productId } = req.body;

    if (!quantity || !price || !invoiceId || !productId) {
      return res.status(400).json({
        success: false,
        message: "quantity, price, invoiceId and productId are required",
      });
    }

    // invoice exists or not
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // product exists or not
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const finalGst = gst ?? 0;
    const total = calculateItemTotal(quantity, price, finalGst);

    const invoiceItem = await prisma.invoiceItem.create({
      data: {
        quantity: Number(quantity),
        price: Number(price),
        gst: Number(finalGst),
        total,
        invoiceId,
        productId,
      },
      include: {
        invoice: true,
        product: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Invoice item created successfully",
      invoiceItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= GET ALL INVOICE ITEMS =================
export const getAllInvoiceItems = async (req, res) => {
  try {
    const invoiceItems = await prisma.invoiceItem.findMany({
      include: {
        invoice: true,
        product: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      invoiceItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= GET SINGLE INVOICE ITEM =================
export const getInvoiceItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoiceItem = await prisma.invoiceItem.findUnique({
      where: { id },
      include: {
        invoice: true,
        product: true,
      },
    });

    if (!invoiceItem) {
      return res.status(404).json({
        success: false,
        message: "Invoice item not found",
      });
    }

    return res.status(200).json({
      success: true,
      invoiceItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= GET ITEMS BY INVOICE ID =================
export const getInvoiceItemsByInvoiceId = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const invoiceItems = await prisma.invoiceItem.findMany({
      where: { invoiceId },
      include: {
        product: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      invoiceItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= UPDATE INVOICE ITEM =================
export const updateInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price, gst, invoiceId, productId } = req.body;

    const existingInvoiceItem = await prisma.invoiceItem.findUnique({
      where: { id },
    });

    if (!existingInvoiceItem) {
      return res.status(404).json({
        success: false,
        message: "Invoice item not found",
      });
    }

    // final invoiceId
    const finalInvoiceId = invoiceId || existingInvoiceItem.invoiceId;

    // final productId
    const finalProductId = productId || existingInvoiceItem.productId;

    // check invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: finalInvoiceId },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // check product exists
    const product = await prisma.product.findUnique({
      where: { id: finalProductId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const finalQuantity =
      quantity !== undefined ? Number(quantity) : existingInvoiceItem.quantity;

    const finalPrice =
      price !== undefined ? Number(price) : existingInvoiceItem.price;

    const finalGst =
      gst !== undefined ? Number(gst) : existingInvoiceItem.gst;

    const total = calculateItemTotal(finalQuantity, finalPrice, finalGst);

    const updatedInvoiceItem = await prisma.invoiceItem.update({
      where: { id },
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

    return res.status(200).json({
      success: true,
      message: "Invoice item updated successfully",
      invoiceItem: updatedInvoiceItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= DELETE INVOICE ITEM =================


export const deleteInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existingInvoiceItem = await prisma.invoiceItem.findUnique({
      where: { id },
    });

    if (!existingInvoiceItem) {
      return res.status(404).json({
        success: false,
        message: "Invoice item not found",
      });
    }

    await prisma.invoiceItem.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice item deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};