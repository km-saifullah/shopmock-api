import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorMiddleware } from "./middlewares/error.middleware";
import { healthRouter } from "./modules/health/health.routes";
import { categoryRouter } from "./modules/mock/categories/category.routes";
import { productRouter } from "./modules/mock/products/product.routes";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    maxAge: 86400,
  }),
);

app.use(
  pinoHttp({
    logger,
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.x-api-key",
    ],
  }),
);

app.use(
  express.json({
    limit: "100kb",
    strict: true,
  }),
);

app.use(
  env.API_PREFIX,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      },
    },
  }),
);

app.use("/health", healthRouter);

app.use(`${env.API_PREFIX}/categories`, categoryRouter);
app.use(`${env.API_PREFIX}/products`, productRouter);

app.use(errorMiddleware);

export { app };
