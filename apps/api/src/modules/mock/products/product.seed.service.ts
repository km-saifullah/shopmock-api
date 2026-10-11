import { Product } from "./product.model";
import { productSeedData } from "./product.seed";

export async function seedProducts(): Promise<number> {
  const operations = productSeedData.map((product) => ({
    updateOne: {
      filter: { id: product.id },
      update: {
        $set: product,
      },
      upsert: true,
    },
  }));

  if (operations.length === 0) {
    return 0;
  }

  const result = await Product.bulkWrite(operations, {
    ordered: true,
  });

  return result.upsertedCount + result.modifiedCount;
}
