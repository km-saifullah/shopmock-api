import { Router } from "express";
import mongoose from "mongoose";

const healthRouter = Router();

/**
 * @openapi
 * /health/live:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check whether the API process is alive
 *     responses:
 *       200:
 *         description: The API process is running
 */
healthRouter.get("/live", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "alive",
      service: "shopmock-api",
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @openapi
 * /health/ready:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check whether the API is ready to serve requests
 *     responses:
 *       200:
 *         description: The API and database are ready
 *       503:
 *         description: The database is not connected
 */
healthRouter.get("/ready", (_req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  if (!isDatabaseConnected) {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_NOT_READY",
        message: "The database connection is not ready.",
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: {
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    },
  });
});

export { healthRouter };
