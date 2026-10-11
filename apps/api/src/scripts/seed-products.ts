import { connectMongoDB, disconnectMongoDB } from "../database/mongodb";
import { logger } from "../config/logger";
import { seedProducts } from "../modules/mock/products/product.seed.service";

async function main(): Promise<void> {
  try {
    await connectMongoDB();

    const affectedProducts = await seedProducts();

    logger.info({ affectedProducts }, "Product seeding completed successfully");
  } finally {
    await disconnectMongoDB();
  }
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, "Product seeding failed");
  process.exitCode = 1;
});
