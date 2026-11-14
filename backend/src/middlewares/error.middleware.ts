import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("[Error Handler]", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        message: "Duplicate key error. A record with this unique value already exists.",
      },
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    },
  });
};
