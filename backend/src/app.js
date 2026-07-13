import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import invoiceRouter from "../src/routes/invoice.routes.js";
import discountRoutes from "./routes/discount.routes.js";
import invoiceItemRoutes from "./routes/invoiceItem.routes.js";



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/discount", discountRoutes)
app.use("/api/v1/invoice-items", invoiceItemRoutes);


export default app;