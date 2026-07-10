import {
  createInvoiceService,
  getAllInvoicesService,
  getInvoiceByIdService,
  getInvoiceByNumberService,
  updateInvoiceService,
  cancelInvoiceService,
  getInvoiceStatsService,
} from "../services/invoice.service.js";

const getErrorStatusCode = (
  message = ""
) => {
  const normalizedMessage =
    String(message).toLowerCase();

  if (
    normalizedMessage.includes(
      "unauthorized"
    )
  ) {
    return 401;
  }

  if (
    normalizedMessage.includes(
      "not found"
    )
  ) {
    return 404;
  }

  if (
    normalizedMessage.includes(
      "already"
    ) ||
    normalizedMessage.includes(
      "cannot"
    ) ||
    normalizedMessage.includes(
      "invalid"
    ) ||
    normalizedMessage.includes(
      "insufficient"
    ) ||
    normalizedMessage.includes(
      "required"
    ) ||
    normalizedMessage.includes(
      "exceed"
    )
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
    fallbackMessage,
    error
  );

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return res
    .status(
      getErrorStatusCode(message)
    )
    .json({
      success: false,
      message:
        message || fallbackMessage,
    });
};

// ======================================================
// CREATE INVOICE
// ======================================================

export const createInvoiceController =
  async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized user",
        });
      }

      const invoice =
        await createInvoiceService(
          req.body,
          userId
        );

      return res.status(201).json({
        success: true,
        message:
          "Invoice created successfully",
        data: invoice,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to create invoice"
      );
    }
  };

// ======================================================
// GET ALL INVOICES
// ======================================================

export const getAllInvoicesController =
  async (req, res) => {
    try {
      const result =
        await getAllInvoicesService(
          req.query
        );

      return res.status(200).json({
        success: true,
        message:
          "Invoices fetched successfully",
        data: result.invoices,
        summary: result.summary,
        pagination:
          result.pagination,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch invoices"
      );
    }
  };

// ======================================================
// GET INVOICE STATS
// ======================================================

export const getInvoiceStatsController =
  async (req, res) => {
    try {
      const stats =
        await getInvoiceStatsService();

      return res.status(200).json({
        success: true,
        message:
          "Invoice statistics fetched successfully",
        data: stats,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch invoice statistics"
      );
    }
  };

// ======================================================
// GET INVOICE BY NUMBER
// ======================================================

export const getInvoiceByNumberController =
  async (req, res) => {
    try {
      const { invoiceNumber } =
        req.params;

      const invoice =
        await getInvoiceByNumberService(
          invoiceNumber
        );

      return res.status(200).json({
        success: true,
        message:
          "Invoice fetched successfully",
        data: invoice,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch invoice"
      );
    }
  };

// ======================================================
// GET INVOICE BY ID
// ======================================================

export const getInvoiceByIdController =
  async (req, res) => {
    try {
      const { invoiceId } =
        req.params;

      const invoice =
        await getInvoiceByIdService(
          invoiceId
        );

      return res.status(200).json({
        success: true,
        message:
          "Invoice fetched successfully",
        data: invoice,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch invoice"
      );
    }
  };

// ======================================================
// UPDATE INVOICE
// ======================================================

export const updateInvoiceController =
  async (req, res) => {
    try {
      const { invoiceId } =
        req.params;

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized user",
        });
      }

      const invoice =
        await updateInvoiceService(
          invoiceId,
          req.body,
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Invoice updated successfully",
        data: invoice,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to update invoice"
      );
    }
  };

// ======================================================
// CANCEL INVOICE
// ======================================================

export const cancelInvoiceController =
  async (req, res) => {
    try {
      const { invoiceId } =
        req.params;

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized user",
        });
      }

      const invoice =
        await cancelInvoiceService(
          invoiceId,
          req.body,
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Invoice cancelled successfully",
        data: invoice,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        error,
        "Failed to cancel invoice"
      );
    }
  };