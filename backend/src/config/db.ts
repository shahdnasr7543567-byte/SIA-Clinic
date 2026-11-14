import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    process.exit(1);
  }
};
