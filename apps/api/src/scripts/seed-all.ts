import { connectMongoDB, disconnectMongoDB } from "../database/mongodb";
import { logger } from "../config/logger";
import { seedCategories } from "../modules/mock/categories/category.seed.service";
import { seedProducts } from "../modules/mock/products/product.seed.service";

async function main(): Promise<void> {
  try {
    await connectMongoDB();

    const affectedCategories = await seedCategories();
    logger.info({ affectedCategories }, "Category seeding completed");

    const affectedProducts = await seedProducts();
    logger.info({ affectedProducts }, "Product seeding completed");

    logger.info("All mock data seeded successfully");
  } finally {
    await disconnectMongoDB();
  }
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, "Database seeding failed");
  process.exitCode = 1;
});
