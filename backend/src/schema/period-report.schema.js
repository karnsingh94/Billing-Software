import { z } from "zod";

// Change these enum values only if your Prisma enums
// use different names.
const reportTypeEnum = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
  "CUSTOM",
]);

const reportFormatEnum = z.enum([
  "JSON",
  "PDF",
  "EXCEL",
  "CSV",
]);

const reportStatusEnum = z.enum([
  "GENERATING",
  "COMPLETED",
  "FAILED",
]);

const recordTypeEnum = z.enum([
  "ALL",
  "INVOICE",
  "PAYMENT",
  "RETURN",
]);

export const generateReportSchema = z.object({
  body: z
    .object({
      reportName: z
        .string()
        .trim()
        .min(2, "Report name must contain at least 2 characters")
        .max(200, "Report name cannot exceed 200 characters"),

      reportType: reportTypeEnum,

      format: reportFormatEnum.optional().default("JSON"),

      startDate: z
        .string()
        .trim()
        .min(1, "Start date is required"),

      endDate: z
        .string()
        .trim()
        .min(1, "End date is required"),

      day: z.coerce
        .number()
        .int()
        .min(1)
        .max(31)
        .optional()
        .nullable(),

      week: z.coerce
        .number()
        .int()
        .min(1)
        .max(53)
        .optional()
        .nullable(),

      month: z.coerce
        .number()
        .int()
        .min(1)
        .max(12)
        .optional()
        .nullable(),

      year: z.coerce
        .number()
        .int()
        .min(2000)
        .max(3000)
        .optional()
        .nullable(),

      recordType: recordTypeEnum.optional().default("ALL"),

      search: z
        .string()
        .trim()
        .optional()
        .nullable(),

      sortOrder: z
        .enum(["asc", "desc"])
        .optional()
        .default("desc"),

      page: z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .default(1),

      limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .optional()
        .default(10),
    })
    .superRefine((data, ctx) => {
      const start = new Date(`${data.startDate}T00:00:00`);
      const end = new Date(`${data.endDate}T23:59:59.999`);

      if (Number.isNaN(start.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "Invalid start date",
        });
      }

      if (Number.isNaN(end.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "Invalid end date",
        });
      }

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        start > end
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be greater than or equal to start date",
        });
      }
    }),
});

export const reportIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid report ID"),
  }),
});

export const reportQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),

    reportType: reportTypeEnum.optional(),

    format: reportFormatEnum.optional(),

    status: reportStatusEnum.optional(),

    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),

    page: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(10),
  }),
});