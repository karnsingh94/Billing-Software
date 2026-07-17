import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import invoiceRouter from "../src/routes/invoice.routes.js";
import discountRoutes from "./routes/discount.routes.js";
import invoiceItemRoutes from "./routes/invoiceItem.routes.js";
import dateRangeReportRouter from "./routes/period-report.routes.js";
import couponRoutes from "./routes/coupon.routes.js";



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);




app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/discount", discountRoutes)
app.use("/api/v1/invoice-items", invoiceItemRoutes);    
app.use(
  "/api/v1/reports",
  dateRangeReportRouter
);
app.use("/api/v1/coupons", couponRoutes);

export default app;







