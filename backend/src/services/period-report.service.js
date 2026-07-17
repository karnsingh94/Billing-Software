import prisma from "../db/db.js";

// ======================================================
// HELPERS
// ======================================================

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
};

const makeJsonSafe = (value) => {
  return JSON.parse(
    JSON.stringify(value, (_, item) => {
      if (typeof item === "bigint") {
        return item.toString();
      }

      if (
        item &&
        typeof item === "object" &&
        typeof item.toNumber === "function"
      ) {
        return item.toNumber();
      }

      return item;
    })
  );
};

const getStartDate = (value) => {
  if (!value) {
    throw new Error("startDate is required");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid startDate");
  }

  return date;
};

const getEndDate = (value) => {
  if (!value) {
    throw new Error("endDate is required");
  }

  const date = new Date(`${value}T23:59:59.999Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid endDate");
  }

  return date;
};

// Inclusive days:
// Same date = 1 day
// July 1 to July 7 = 7 days
const getTotalDays = (startDate, endDate) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const start = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );

  const end = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  );

  return Math.floor((end - start) / millisecondsPerDay) + 1;
};

const getAutomaticReportType = (totalDays) => {
  if (totalDays === 1) {
    return "DAILY";
  }

  if (totalDays <= 7) {
    return "WEEKLY";
  }

if (totalDays <= 31) {
    return "MONTHLY";
  }

  return "YEARLY";

};

const getReportPeriodValues = (
  reportType,
  startDate,
  totalDays
) => {
  const values = {
    day: null,
    week: null,
    month: null,
    year: startDate.getUTCFullYear(),
  };

  if (reportType === "DAILY") {
    values.day = startDate.getUTCDate();
    values.month = startDate.getUTCMonth() + 1;
  }

  if (reportType === "WEEKLY") {
    values.week = Math.ceil(
      startDate.getUTCDate() / 7
    );

    values.month = startDate.getUTCMonth() + 1;
  }

  if (reportType === "MONTHLY") {
    values.month = startDate.getUTCMonth() + 1;
  }

  if (reportType === "YEARLY") {
    values.day = null;
    values.week = null;
    values.month = null;
    values.year = startDate.getUTCFullYear();
  }

  return {
    ...values,
    totalDays,
  };
};

const getDefaultReportName = (
  reportType,
  startDateValue,
  endDateValue
) => {
  if (reportType === "DAILY") {
    return `${startDateValue} Daily Report`;
  }

  if (reportType === "WEEKLY") {
    return `${startDateValue} to ${endDateValue} Weekly Report`;
  }

  if (reportType === "MONTHLY") {
    return `${startDateValue} to ${endDateValue} Monthly Report`;
  }

  return `${startDateValue} to ${endDateValue} Yearly Report`;
};

// ======================================================
// GENERATE AND SAVE REPORT
// ======================================================

export const getDateRangeReportService = async (
  input,
  loggedInUserId
) => {
  const {
    startDate,
    endDate,
    reportName,
    format = "JSON",
  } = input;

  if (!loggedInUserId) {
    throw new Error("Unauthorized user");
  }

  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  if (start > end) {
    throw new Error(
      "startDate cannot be greater than endDate"
    );
  }

  // ====================================================
  // CHECK USER
  // ====================================================

  const user = await prisma.user.findFirst({
    where: {
      id: loggedInUserId,
      deletedAt: null,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("Logged-in user not found");
  }

  // ====================================================
  // AUTOMATIC REPORT TYPE
  // ====================================================

  const totalDays = getTotalDays(start, end);

  const reportType =
    getAutomaticReportType(totalDays);

  const periodValues =
    getReportPeriodValues(
      reportType,
      start,
      totalDays
    );

  const finalReportName =
    reportName?.trim() ||
    getDefaultReportName(
      reportType,
      startDate,
      endDate
    );

  const normalizedFormat = String(
    format || "JSON"
  )
    .trim()
    .toUpperCase();

  // Change these values only if your ReportFormat enum
  // contains different names.
  const allowedFormats = [
    "JSON",
    "PDF",
    "CSV",
    "EXCEL",
  ];

  if (!allowedFormats.includes(normalizedFormat)) {
    throw new Error(
      `Invalid format. Allowed formats: ${allowedFormats.join(", ")}`
    );
  }

  // ====================================================
  // DATE FILTERS
  // ====================================================

  const productWhere = {
    createdAt: {
      gte: start,
      lte: end,
    },

    deletedAt: null,
  };

  const invoiceWhere = {
    createdAt: {
      gte: start,
      lte: end,
    },
  };

  const paymentWhere = {
    createdAt: {
      gte: start,
      lte: end,
    },
  };

  const returnWhere = {
    returnDate: {
      gte: start,
      lte: end,
    },
  };

  // ====================================================
  // FETCH REPORT DATA
  // ====================================================

  const [
    products,
    invoices,
    payments,
    returns,

    invoiceTotals,
    paymentTotals,
    returnTotals,

    invoiceStatusGroups,
    paymentStatusGroups,
    returnStatusGroups,
    paymentMethodGroups,
  ] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,

      select: {
        id: true,
        productName: true,
        productImage: true,
        productPrice: true,
        gst: true,
        sellingPrice: true,
        stock: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.invoice.findMany({
      where: invoiceWhere,

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            product: true,
          },
        },

        discounts: true,

        payment: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },

        returns: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.payment.findMany({
      where: paymentWhere,

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            product: true,
          },
        },

        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            customerName: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.return.findMany({
      where: returnWhere,

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },

        product: true,

        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            customerName: true,
            status: true,
          },
        },
      },

      orderBy: {
        returnDate: "desc",
      },
    }),

    prisma.invoice.aggregate({
      where: {
        ...invoiceWhere,

        status: {
          not: "CANCELLED",
        },
      },

      _count: {
        id: true,
      },

      _sum: {
        subTotal: true,
        discountAmount: true,
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
      },
    }),

    prisma.payment.aggregate({
      where: paymentWhere,

      _count: {
        id: true,
      },

      _sum: {
        subtotal: true,
        discountAmount: true,
        finalAmount: true,
        paidAmount: true,
        dueAmount: true,
      },
    }),

    prisma.return.aggregate({
      where: returnWhere,

      _count: {
        id: true,
      },

      _sum: {
        subTotal: true,
        grandTotal: true,
      },
    }),

    prisma.invoice.groupBy({
      by: ["status"],
      where: invoiceWhere,

      _count: {
        id: true,
      },
    }),

    prisma.payment.groupBy({
      by: ["status"],
      where: paymentWhere,

      _count: {
        id: true,
      },

      _sum: {
        paidAmount: true,
      },
    }),

    prisma.return.groupBy({
      by: ["refundStatus"],
      where: returnWhere,

      _count: {
        id: true,
      },

      _sum: {
        grandTotal: true,
      },
    }),

    prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: paymentWhere,

      _count: {
        id: true,
      },

      _sum: {
        paidAmount: true,
      },
    }),
  ]);

  // ====================================================
  // UNIQUE PRODUCT AND USER COUNT
  // ====================================================

  const uniqueProductIds = new Set();
  const uniqueUserIds = new Set();

  products.forEach((product) => {
    uniqueProductIds.add(product.id);

    if (product.userId) {
      uniqueUserIds.add(product.userId);
    }
  });

  invoices.forEach((invoice) => {
    if (invoice.user?.id) {
      uniqueUserIds.add(invoice.user.id);
    }

    invoice.items?.forEach((item) => {
      if (item.productId) {
        uniqueProductIds.add(item.productId);
      }
    });
  });

  payments.forEach((payment) => {
    if (payment.user?.id) {
      uniqueUserIds.add(payment.user.id);
    }

    payment.items?.forEach((item) => {
      if (item.productId) {
        uniqueProductIds.add(item.productId);
      }
    });
  });

  returns.forEach((returnItem) => {
    if (returnItem.user?.id) {
      uniqueUserIds.add(returnItem.user.id);
    }

    if (returnItem.productId) {
      uniqueProductIds.add(returnItem.productId);
    }
  });

  // ====================================================
  // TOTAL CALCULATIONS
  // ====================================================

  const totalSales = toNumber(
    invoiceTotals._sum.totalAmount
  );

  const totalPaid = toNumber(
    invoiceTotals._sum.paidAmount
  );

  const totalDue = toNumber(
    invoiceTotals._sum.dueAmount
  );

  const totalDiscount = toNumber(
    invoiceTotals._sum.discountAmount
  );

  const totalPaymentReceived = toNumber(
    paymentTotals._sum.paidAmount
  );

  const totalRefund = toNumber(
    returnTotals._sum.grandTotal
  );

  const netRevenue =
    totalPaymentReceived - totalRefund;

  const totalRecords =
    products.length +
    invoices.length +
    payments.length +
    returns.length;

  // ====================================================
  // COMPLETE JSON REPORT DATA
  // ====================================================

  const generatedReportData = makeJsonSafe({
    reportPeriod: {
      startDate: start,
      endDate: end,
      totalDays,
      reportType,
    },

    summary: {
      totalProducts: uniqueProductIds.size,
      totalUsers: uniqueUserIds.size,
      totalInvoices:
        invoiceTotals._count.id || 0,
      totalPayments:
        paymentTotals._count.id || 0,
      totalReturns:
        returnTotals._count.id || 0,
      totalSales,
      totalPaid,
      totalDue,
      totalDiscount,
      totalPaymentReceived,
      totalRefund,
      netRevenue,
      totalRecords,
    },

    invoiceStatus: invoiceStatusGroups.map(
      (item) => ({
        status: item.status,
        count: item._count.id,
      })
    ),

    paymentStatus: paymentStatusGroups.map(
      (item) => ({
        status: item.status,
        count: item._count.id,
        amount: toNumber(
          item._sum.paidAmount
        ),
      })
    ),

    returnStatus: returnStatusGroups.map(
      (item) => ({
        status: item.refundStatus,
        count: item._count.id,
        amount: toNumber(
          item._sum.grandTotal
        ),
      })
    ),

    paymentMethods: paymentMethodGroups.map(
      (item) => ({
        paymentMethod: item.paymentMethod,
        count: item._count.id,
        amount: toNumber(
          item._sum.paidAmount
        ),
      })
    ),

    products,
    invoices,
    payments,
    returns,
  });

  const filters = makeJsonSafe({
    startDate,
    endDate,
    totalDays,
    automaticReportType: reportType,
    format: normalizedFormat,
  });

  // ====================================================
  // REPORT TABLE DATA
  // ====================================================

  const reportDatabaseData = {
    reportName: finalReportName,
    reportType,
    format: normalizedFormat,
    status: "COMPLETED",

    startDate: start,
    endDate: end,

    day: periodValues.day,
    week: periodValues.week,
    month: periodValues.month,
    year: periodValues.year,

    filters,
    reportData: generatedReportData,

    totalProducts: uniqueProductIds.size,
    totalUsers: uniqueUserIds.size,

    totalInvoices:
      invoiceTotals._count.id || 0,

    totalPayments:
      paymentTotals._count.id || 0,

    totalReturns:
      returnTotals._count.id || 0,

    totalSales,
    totalPaid,
    totalDue,
    totalDiscount,
    totalPaymentReceived,
    totalRefund,
    netRevenue,

    fileUrl: null,
    errorMessage: null,

    totalRecords,

    updatedBy: loggedInUserId,
  };

  // ====================================================
  // FIND SAME REPORT
  // ====================================================

  const existingReport =
    await prisma.report.findFirst({
      where: {
        reportType,
        format: normalizedFormat,
        startDate: start,
        endDate: end,
        userId: loggedInUserId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  // ====================================================
  // UPDATE OR CREATE
  // ====================================================

  let savedReport;

  if (existingReport) {
    savedReport = await prisma.report.update({
      where: {
        id: existingReport.id,
      },

      data: reportDatabaseData,
    });
  } else {
    savedReport = await prisma.report.create({
      data: {
        ...reportDatabaseData,

        createdBy: loggedInUserId,
        userId: loggedInUserId,
      },
    });
  }

  // Returns only Report model fields
  return makeJsonSafe(savedReport);
};