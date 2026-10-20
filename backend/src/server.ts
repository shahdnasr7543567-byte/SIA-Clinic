import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { initFirebase } from "./config/firebase.js";
import { ENV } from "./config/env.js";

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Firebase Admin (for Phone Auth verification)
    initFirebase();

    const app = createApp();

    app.listen(ENV.PORT, () => {
      console.log(`[SIA Backend] Server is running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
      console.log(`[SIA Backend] Health check: http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (error) {
    console.error("[SIA Backend] Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
