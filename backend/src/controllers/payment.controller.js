import {
  createPaymentService,
  getAllPaymentsService,
  getPaymentByIdService,
  refundPaymentService,
} from "../services/payment.service.js";

const getStatusCode = (message = "") => {
  const text =
    String(message).toLowerCase();

  if (
    text.includes("unauthorized")
  ) {
    return 401;
  }

  if (
    text.includes("not found")
  ) {
    return 404;
  }

  if (
    text.includes("required") ||
    text.includes("invalid") ||
    text.includes("stock") ||
    text.includes("discount") ||
    text.includes("quantity") ||
    text.includes("cannot") ||
    text.includes("already")
  ) {
    return 400;
  }

  return 500;
};

const sendError = (
  res,
  error,
  fallbackMessage
) => {
  console.error(
    "PAYMENT API ERROR:",
    error
  );

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return res
    .status(getStatusCode(message))
    .json({
      success: false,
      message:
        message || fallbackMessage,
    });
};

// ======================================================
// CREATE
// ======================================================

export const createPaymentController = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized user",
      });
    }
console.log(req.body)
    const payment =
      await createPaymentService(
        req.body,
        userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to create payment"
    );
  }
};

// ======================================================
// GET ALL
// ======================================================

export const getAllPaymentsController = async (
  req,
  res
) => {
  try {
    const result =
      await getAllPaymentsService(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Payments fetched successfully",
      data: result.payments,
      summary: result.summary,
      pagination:
        result.pagination,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch payments"
    );
  }
};

// ======================================================
// GET BY ID
// ======================================================

export const getPaymentByIdController = async (
  req,
  res
) => {
  try {
    const payment =
      await getPaymentByIdService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch payment"
    );
  }
};

// ======================================================
// REFUND
// ======================================================

export const refundPaymentController = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized user",
      });
    }

    const payment =
      await refundPaymentService(
        req.params.id,
        req.body,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Payment refunded successfully",
      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to refund payment"
    );
  }
};