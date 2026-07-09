import {
  createPaymentService,
  getAllPaymentsService,
  getPaymentByIdService,
  deletePaymentService,
} from "../services/payment.service.js";

export const createPaymentController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const payment = await createPaymentService(req.body, userId);

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPaymentsController = async (req, res) => {
  try {
    const payments = await getAllPaymentsService();

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentByIdController = async (req, res) => {
  try {
    const payment = await getPaymentByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePaymentController = async (req, res) => {
  try {
    const deletedPayment = await deletePaymentService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      data: deletedPayment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};