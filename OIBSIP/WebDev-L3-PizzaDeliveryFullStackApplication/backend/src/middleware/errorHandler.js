import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = Number(err.statusCode || err.status || 500);
  const safeStatus = status >= 400 && status <= 599 ? status : 500;
  if (safeStatus >= 500) logger.error({ err, method: req.method, path: req.path }, "Unhandled request error");
  else logger.warn({ status: safeStatus, method: req.method, path: req.path, message: err.message }, "Request rejected");
  res.status(safeStatus).json({
    success: false,
    message: safeStatus >= 500 && process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && err.details ? { details: err.details } : {})
  });
};