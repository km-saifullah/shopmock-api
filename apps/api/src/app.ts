import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { openApiSpecification } from "./config/openapi";
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

// OpenAPI documentation endpoints
app.get("/docs.json", (_req, res) => {
  res.status(200).json(openApiSpecification);
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpecification, {
    explorer: true,
    customSiteTitle: "ShopMock API Documentation",
    swaggerOptions: {
      persistAuthorization: false,
    },
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

// Return consistent JSON for requests that do not match any route
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "The requested endpoint does not exist.",
    },
  });
});

// Error handling must remain after all routes and the 404 handler
app.use(errorMiddleware);

export { app };
