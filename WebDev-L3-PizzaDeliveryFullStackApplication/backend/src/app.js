import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import authRouter from "./modules/auth/auth.routes.js";
import inventoryRouter from "./modules/inventory/inventory.routes.js";
import catalogRouter from "./modules/catalog/catalog.routes.js";
import productRouter from "./modules/products/product.routes.js";
import checkoutRouter from "./modules/checkout/checkout.routes.js";
import healthRouter from "./routes/health.routes.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Request"]
}));
app.use(pinoHttp({
  logger,
  redact: ["req.headers.authorization", "req.headers.cookie"]
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/v1/admin/inventory", inventoryRouter);
app.use("/api/v1/catalog", catalogRouter);
app.use("/api/v1/checkout", checkoutRouter);
app.use("/api/v1/products", productRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
