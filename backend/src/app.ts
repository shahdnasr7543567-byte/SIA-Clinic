import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ENV } from "./config/env.js";

export const createApp = (): Express => {
  const app = express();

  // Security & standard HTTP middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN === "*" ? true : ENV.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (ENV.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  // Mount main API
  app.use("/api", apiRouter);

  // 404 Fallback
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      error: { message: `Route ${req.originalUrl} not found` },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
