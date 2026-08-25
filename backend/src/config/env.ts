import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sia_clinic",
  JWT_SECRET: process.env.JWT_SECRET || "default_sia_jwt_secret_key_change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  CLINIC_DEFAULT_CAPACITY: process.env.CLINIC_DEFAULT_CAPACITY
    ? parseInt(process.env.CLINIC_DEFAULT_CAPACITY, 10)
    : 50,
};
