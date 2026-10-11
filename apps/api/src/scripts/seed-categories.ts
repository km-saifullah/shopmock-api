import { connectMongoDB, disconnectMongoDB } from "../database/mongodb";
import { logger } from "../config/logger";
import { seedCategories } from "../modules/mock/categories/category.seed.service";

async function main(): Promise<void> {
  try {
    await connectMongoDB();

    const affectedCategories = await seedCategories();

    logger.info(
      { affectedCategories },
      "Category seeding completed successfully",
    );
  } finally {
    await disconnectMongoDB();
  }
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, "Category seeding failed");
  process.exitCode = 1;
});
