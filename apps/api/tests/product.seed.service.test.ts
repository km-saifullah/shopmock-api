import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectMongoDB, disconnectMongoDB } from "../src/database/mongodb";
import { Product } from "../src/modules/mock/products/product.model";
import { productSeedData } from "../src/modules/mock/products/product.seed";
import { seedProducts } from "../src/modules/mock/products/product.seed.service";

describe("Product seed service", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await disconnectMongoDB();
  });

  it("preserves seeded product IDs and avoids duplicates when run repeatedly", async () => {
    await seedProducts();

    const firstRunProducts = await Product.find({})
      .select({ _id: 0, id: 1 })
      .sort({ id: 1 })
      .lean();

    await seedProducts();

    const secondRunProducts = await Product.find({})
      .select({ _id: 0, id: 1 })
      .sort({ id: 1 })
      .lean();

    const expectedIds = productSeedData.map((product) => product.id).sort();

    expect(firstRunProducts.map((product) => product.id)).toEqual(expectedIds);
    expect(secondRunProducts.map((product) => product.id)).toEqual(expectedIds);
    expect(await Product.countDocuments({})).toBe(productSeedData.length);
  });

  it("reports zero writes when all seeded products are already unchanged", async () => {
    await seedProducts();

    const result = await seedProducts();

    expect(result).toBe(0);
    expect(await Product.countDocuments({})).toBe(productSeedData.length);
  });
});
