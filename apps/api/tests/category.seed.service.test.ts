import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectMongoDB, disconnectMongoDB } from "../src/database/mongodb";
import { Category } from "../src/modules/mock/categories/category.model";
import { categorySeedData } from "../src/modules/mock/categories/category.seed";
import { seedCategories } from "../src/modules/mock/categories/category.seed.service";

describe("Category seed service", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  beforeEach(async () => {
    await Category.deleteMany({});
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await disconnectMongoDB();
  });

  it("preserves seeded category IDs and avoids duplicates when run repeatedly", async () => {
    await seedCategories();

    const firstRunCategories = await Category.find({})
      .select({ _id: 0, id: 1 })
      .sort({ id: 1 })
      .lean();

    await seedCategories();

    const secondRunCategories = await Category.find({})
      .select({ _id: 0, id: 1 })
      .sort({ id: 1 })
      .lean();

    const expectedIds = categorySeedData.map((category) => category.id).sort();

    expect(firstRunCategories.map((category) => category.id)).toEqual(
      expectedIds,
    );
    expect(secondRunCategories.map((category) => category.id)).toEqual(
      expectedIds,
    );
    expect(await Category.countDocuments({})).toBe(categorySeedData.length);
  });

  it("reports zero writes when all seeded categories are already unchanged", async () => {
    await seedCategories();

    const result = await seedCategories();

    expect(result).toBe(0);
    expect(await Category.countDocuments({})).toBe(categorySeedData.length);
  });
});
