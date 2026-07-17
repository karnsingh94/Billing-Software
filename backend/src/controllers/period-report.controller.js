import {
  getDateRangeReportService,
} from "../services/period-report.service.js";

const getErrorStatusCode = (message = "") => {
  const text = String(message).toLowerCase();

  if (text.includes("unauthorized")) return 401;
  if (text.includes("not found")) return 404;

  if (
    text.includes("required") ||
    text.includes("invalid") ||
    text.includes("must") ||
    text.includes("cannot") ||
    text.includes("greater") ||
    text.includes("between")
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
  console.error("REPORT API ERROR:", error);

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
// GET DATE RANGE REPORT
// ======================================================

export const getDateRangeReportController =
  async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized user",
        });
      }

      const report =
        await getDateRangeReportService(
          req.query,
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Date-wise report fetched successfully",
        data: report,
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Failed to fetch report"
      );
    }
  };