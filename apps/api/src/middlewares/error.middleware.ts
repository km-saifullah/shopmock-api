import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { env } from "../config/env";

interface HttpError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });

    return;
  }

  const httpError = error instanceof Error ? (error as HttpError) : undefined;

  const requestedStatus = httpError?.statusCode;
  const statusCode =
    typeof requestedStatus === "number" &&
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus <= 599
      ? requestedStatus
      : 500;

  const errorCode =
    statusCode === 500
      ? "INTERNAL_SERVER_ERROR"
      : (httpError?.code ?? "REQUEST_ERROR");

  const message =
    statusCode === 500
      ? "An unexpected error occurred."
      : (httpError?.message ?? "The request could not be completed.");

  logger.error(
    {
      err: error,
      method: req.method,
      path: req.path,
      statusCode,
    },
    "Request failed",
  );

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(env.NODE_ENV !== "production" && httpError?.stack
        ? { stack: httpError.stack }
        : {}),
    },
  });
};
