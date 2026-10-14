import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";

import { connectMongoDB, disconnectMongoDB } from "../src/database/mongodb";
import { Category } from "../src/modules/mock/categories/category.model";
import {
  getCategoryById,
  listCategories,
} from "../src/modules/mock/categories/category.service";

describe("Category service", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  beforeEach(async () => {
    await Category.deleteMany({});

    await Category.insertMany([
      {
        id: "cat_electronics",
        name: "Electronics",
        slug: "electronics",
        description: "Electronic devices and accessories.",
        parentId: null,
        image: null,
        isActive: true,
      },
      {
        id: "cat_clothing",
        name: "Clothing",
        slug: "clothing",
        description: "Apparel and fashion products.",
        parentId: null,
        image: null,
        isActive: true,
      },
      {
        id: "cat_hidden",
        name: "Hidden Category",
        slug: "hidden-category",
        description: "An inactive category.",
        parentId: null,
        image: null,
        isActive: false,
      },
    ]);
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await disconnectMongoDB();
    await mongoose.disconnect();
  });

  it("returns active categories by default", async () => {
    const result = await listCategories();

    expect(result.total).toBe(2);
    expect(result.categories.map((category) => category.id)).toEqual([
      "cat_clothing",
      "cat_electronics",
    ]);
  });

  it("filters categories by parent ID", async () => {
    const result = await listCategories({
      parentId: null,
    });

    expect(result.total).toBe(2);
    expect(
      result.categories.every((category) => category.parentId === null),
    ).toBe(true);
  });

  it("searches category names and descriptions", async () => {
    const result = await listCategories({
      search: "electronic",
    });

    expect(result.total).toBe(1);
    expect(result.categories[0]?.id).toBe("cat_electronics");
  });

  it("returns an active category by ID", async () => {
    const category = await getCategoryById("cat_electronics");

    expect(category).not.toBeNull();
    expect(category?.name).toBe("Electronics");
  });

  it("returns null for a missing category", async () => {
    const category = await getCategoryById("cat_missing");

    expect(category).toBeNull();
  });

  it("does not return inactive categories by ID", async () => {
    const category = await getCategoryById("cat_hidden");

    expect(category).toBeNull();
  });
});
