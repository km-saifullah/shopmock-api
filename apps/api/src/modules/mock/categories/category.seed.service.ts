import { Category } from "./category.model";
import { categorySeedData } from "./category.seed";

export async function seedCategories(): Promise<number> {
  const operations = categorySeedData.map((category) => ({
    updateOne: {
      filter: { id: category.id },
      update: {
        $set: category,
      },
      upsert: true,
    },
  }));

  if (operations.length === 0) {
    return 0;
  }

  const result = await Category.bulkWrite(operations, {
    ordered: true,
  });

  return result.upsertedCount + result.modifiedCount;
}
