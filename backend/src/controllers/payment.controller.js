import {
  createPaymentService,
  getAllPaymentsService,
  getPaymentByIdService,
  getPaymentByNumberService,
  updatePaymentStatusService,
  refundPaymentService,
  getPaymentStatsService,
} from "../services/payment.service.js";

const getErrorStatusCode = (message = "") => {
  const normalizedMessage = String(message).toLowerCase();

  if (
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("token")
  ) {
    return 401;
  }

  if (normalizedMessage.includes("not found")) {
    return 404;
  }

  if (
    normalizedMessage.includes("already") ||
    normalizedMessage.includes("cannot") ||
    normalizedMessage.includes("insufficient") ||
    normalizedMessage.includes("exceed") ||
    normalizedMessage.includes("supports only") ||
    normalizedMessage.includes("invalid") ||
    normalizedMessage.includes("required")
  ) {
    return 400;
  }

  return 500;
};

const sendErrorResponse = (res, error, fallbackMessage) => {
  const message =
    error instanceof Error ? error.message : fallbackMessage;

  console.error(fallbackMessage, error);

  return res.status(getErrorStatusCode(message)).json({
    success: false,
    message: message || fallbackMessage,
  });
};

/**
 * POST /api/v1/payments
 */
export const createPaymentController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const result = await createPaymentService(req.body, userId);

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: result,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to create payment"
    );
  }
};

/**
 * GET /api/v1/payments
 */
export const getAllPaymentsController = async (req, res) => {
  try {
    const result = await getAllPaymentsService(req.query);

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: result.payments,
      summary: result.summary,
      pagination: result.pagination,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch payments"
    );
  }
};

/**
 * GET /api/v1/payments/stats
 */
export const getPaymentStatsController = async (req, res) => {
  try {
    const stats = await getPaymentStatsService();

    return res.status(200).json({
      success: true,
      message: "Payment statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch payment statistics"
    );
  }
};

/**
 * GET /api/v1/payments/number/:paymentNumber
 */
export const getPaymentByNumberController = async (req, res) => {
  try {
    const { paymentNumber } = req.params;

    if (!paymentNumber) {
      return res.status(400).json({
        success: false,
        message: "Payment number is required",
      });
    }

    const payment = await getPaymentByNumberService(paymentNumber);

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch payment"
    );
  }
};

/**
 * GET /api/v1/payments/:paymentId
 */
export const getPaymentByIdController = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const payment = await getPaymentByIdService(paymentId);

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch payment"
    );
  }
};

/**
 * PATCH /api/v1/payments/:paymentId/status
 */
export const updatePaymentStatusController = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const payment = await updatePaymentStatusService(
      paymentId,
      req.body,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update payment status"
    );
  }
};

/**
 * POST /api/v1/payments/:paymentId/refund
 */
export const refundPaymentController = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const payment = await refundPaymentService(
      paymentId,
      req.body,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: payment,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to refund payment"
    );
  }
};