import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../src/app";
import { connectMongoDB, disconnectMongoDB } from "../src/database/mongodb";
import { Product } from "../src/modules/mock/products/product.model";

describe("Product routes", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  beforeEach(async () => {
    await Product.deleteMany({});

    await Product.insertMany([
      {
        id: "prod_headphones",
        title: "Wireless Headphones",
        description: "Over-ear headphones with clear sound.",
        price: 79.99,
        currency: "USD",
        categoryId: "cat_electronics",
        brand: "SoundWave",
        rating: { average: 4.5, count: 100 },
        stock: 25,
        thumbnail: "https://placehold.co/600x400?text=Headphones",
        images: ["https://placehold.co/600x400?text=Headphones"],
        tags: ["audio", "wireless"],
      },
      {
        id: "prod_watch",
        title: "Smart Watch",
        description: "A smartwatch with activity tracking.",
        price: 129.99,
        currency: "USD",
        categoryId: "cat_electronics",
        brand: "TechFit",
        rating: { average: 4.2, count: 50 },
        stock: 15,
        thumbnail: "https://placehold.co/600x400?text=Watch",
        images: ["https://placehold.co/600x400?text=Watch"],
        tags: ["wearable", "fitness"],
      },
      {
        id: "prod_shirt",
        title: "Cotton T-Shirt",
        description: "A comfortable everyday cotton shirt.",
        price: 19.99,
        currency: "USD",
        categoryId: "cat_clothing",
        brand: "Everyday",
        rating: { average: 4.0, count: 30 },
        stock: 60,
        thumbnail: "https://placehold.co/600x400?text=Shirt",
        images: ["https://placehold.co/600x400?text=Shirt"],
        tags: ["clothing", "cotton"],
      },
    ]);
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await disconnectMongoDB();
  });

  it("returns the product list", async () => {
    const response = await request(app).get("/v1/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.meta.total).toBe(3);
  });

  it("supports pagination", async () => {
    const response = await request(app).get("/v1/products?page=1&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta.total).toBe(3);
    expect(response.body.meta.totalPages).toBe(2);
  });

  it("filters products by category", async () => {
    const response = await request(app).get(
      "/v1/products?categoryId=cat_electronics",
    );

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(2);
    expect(
      response.body.data.every(
        (product: { categoryId: string }) =>
          product.categoryId === "cat_electronics",
      ),
    ).toBe(true);
  });

  it("filters products by price range", async () => {
    const response = await request(app).get(
      "/v1/products?minPrice=20&maxPrice=100",
    );

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(1);
    expect(response.body.data[0].id).toBe("prod_headphones");
  });

  it("searches products by text", async () => {
    const response = await request(app).get("/v1/products?search=headphones");

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(1);
    expect(response.body.data[0].id).toBe("prod_headphones");
  });

  it("returns a product by ID", async () => {
    const response = await request(app).get("/v1/products/prod_headphones");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe("prod_headphones");
  });

  it("returns 404 for a missing product", async () => {
    const response = await request(app).get("/v1/products/prod_missing");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("returns 400 for an invalid product ID", async () => {
    const response = await request(app).get("/v1/products/invalid-id");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects an invalid price range", async () => {
    const response = await request(app).get(
      "/v1/products?minPrice=100&maxPrice=20",
    );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
