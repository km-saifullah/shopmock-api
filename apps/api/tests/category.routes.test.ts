import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../src/app";
import { connectMongoDB, disconnectMongoDB } from "../src/database/mongodb";
import { Category } from "../src/modules/mock/categories/category.model";

describe("Category routes", () => {
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
        description: "Clothing and apparel.",
        parentId: null,
        image: null,
        isActive: true,
      },
      {
        id: "cat_hidden",
        name: "Hidden Category",
        slug: "hidden-category",
        description: "Inactive category.",
        parentId: null,
        image: null,
        isActive: false,
      },
    ]);
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await disconnectMongoDB();
  });

  it("returns the active category list", async () => {
    const response = await request(app).get("/v1/categories");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta.total).toBe(2);
  });

  it("limits the public category response to 100 items", async () => {
    const categories = Array.from({ length: 105 }, (_, index) => {
      const number = index + 1;
      const suffix = String(number).padStart(3, "0");

      return {
        id: `cat_test_${suffix}`,
        name: `Test Category ${suffix}`,
        slug: `test-category-${suffix}`,
        description: `Test category ${suffix}.`,
        parentId: null,
        image: null,
        isActive: true,
      };
    });

    await Category.insertMany(categories);

    const response = await request(app).get("/v1/categories");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(100);
    expect(response.body.meta.total).toBe(107);
  });

  it("filters categories by search text", async () => {
    const response = await request(app).get(
      "/v1/categories?search=electronics",
    );

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(1);
    expect(response.body.data[0].id).toBe("cat_electronics");
  });

  it("returns a category by ID", async () => {
    const response = await request(app).get("/v1/categories/cat_electronics");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe("cat_electronics");
  });

  it("returns 404 for a missing category", async () => {
    const response = await request(app).get("/v1/categories/cat_missing");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("CATEGORY_NOT_FOUND");
  });

  it("returns 400 for an invalid category ID", async () => {
    const response = await request(app).get("/v1/categories/invalid-id");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
