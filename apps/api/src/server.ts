import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectMongoDB, disconnectMongoDB } from "./database/mongodb";

async function startServer(): Promise<void> {
  await connectMongoDB();

  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        environment: env.NODE_ENV,
      },
      "ShopMock API server started",
    );
  });

  let isShuttingDown = false;

  const shutdown = (signal: string): void => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    logger.info({ signal }, "Server shutdown requested");

    server.close((error) => {
      void (async () => {
        try {
          if (error) {
            logger.error({ err: error }, "HTTP server shutdown failed");
          }

          await disconnectMongoDB();

          if (error) {
            process.exitCode = 1;
            return;
          }

          logger.info("ShopMock API server stopped");
        } catch (shutdownError: unknown) {
          logger.error({ err: shutdownError }, "Error during server shutdown");

          process.exitCode = 1;
        }
      })();
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error: unknown) => {
  logger.fatal({ err: error }, "Failed to start ShopMock API");
  process.exitCode = 1;
});
