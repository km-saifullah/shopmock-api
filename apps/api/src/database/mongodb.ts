import mongoose from "mongoose";

import { env } from "../config/env";
import { logger } from "../config/logger";

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(
      {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      "MongoDB connected successfully",
    );
  } catch (error: unknown) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();

  logger.info("MongoDB disconnected successfully");
}
