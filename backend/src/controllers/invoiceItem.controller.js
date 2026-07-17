import {
  createInvoiceItemService,
  getAllInvoiceItemsService,
  getInvoiceItemByIdService,
  getInvoiceItemsByInvoiceIdService,
  updateInvoiceItemService,
  deleteInvoiceItemService,
} from "../services/invoiceItem.service.js";

// ======================================================
// ERROR HELPERS
// ======================================================

const getErrorStatusCode = (message = "") => {
  const text =
    String(message).toLowerCase();

  if (
    text.includes("unauthorized") ||
    text.includes("logged-in user")
  ) {
    return 401;
  }

  if (
    text.includes("forbidden") ||
    text.includes("only admin")
  ) {
    return 403;
  }

  if (text.includes("not found")) {
    return 404;
  }

  if (
    text.includes("required") ||
    text.includes("invalid") ||
    text.includes("cannot") ||
    text.includes("must")
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
  console.error(
    "INVOICE ITEM ERROR:",
    error
  );

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return res
    .status(getErrorStatusCode(message))
    .json({
      success: false,
      message:
        message || fallbackMessage,
    });
};

// ======================================================
// CREATE INVOICE ITEM
// ======================================================

export const createInvoiceItem = async (
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

    const invoiceItem =
      await createInvoiceItemService(
        req.body,
        userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Invoice item created successfully",
      invoiceItem,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to create invoice item"
    );
  }
};

// ======================================================
// GET ALL INVOICE ITEMS
// ======================================================

export const getAllInvoiceItems = async (
  req,
  res
) => {
  try {
    const result =
      await getAllInvoiceItemsService(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Invoice items fetched successfully",
      invoiceItems:
        result.invoiceItems,
      summary: result.summary,
      pagination:
        result.pagination,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch invoice items"
    );
  }
};

// ======================================================
// GET SINGLE INVOICE ITEM
// ======================================================

export const getInvoiceItemById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const invoiceItem =
      await getInvoiceItemByIdService(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        "Invoice item fetched successfully",
      invoiceItem,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch invoice item"
    );
  }
};

// ======================================================
// GET ITEMS BY INVOICE ID
// ======================================================

export const getInvoiceItemsByInvoiceId =
  async (req, res) => {
    try {
      const { invoiceId } = req.params;

      const result =
        await getInvoiceItemsByInvoiceIdService(
          invoiceId
        );

      return res.status(200).json({
        success: true,
        message:
          "Invoice items fetched successfully",
        invoice: result.invoice,
        invoiceItems:
          result.invoiceItems,
        summary: result.summary,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch invoice items"
      );
    }
  };

// ======================================================
// UPDATE INVOICE ITEM
// ======================================================

export const updateInvoiceItem = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const invoiceItem =
      await updateInvoiceItemService(
        id,
        req.body,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Invoice item updated successfully",
      invoiceItem,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update invoice item"
    );
  }
};

// ======================================================
// DELETE INVOICE ITEM
// ======================================================

export const deleteInvoiceItem = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const result =
      await deleteInvoiceItemService(
        id,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Invoice item deleted successfully",
      data: result,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to delete invoice item"
    );
  }
};