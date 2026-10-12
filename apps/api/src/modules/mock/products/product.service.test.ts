import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectMongoDB, disconnectMongoDB } from "../../../database/mongodb";
import { Product } from "./product.model";
import { getProductById, listProducts } from "./product.service";

describe("Product service", () => {
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

  it("lists all products with pagination metadata", async () => {
    const result = await listProducts();

    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(result.products).toHaveLength(3);
  });

  it("limits the number of returned products", async () => {
    const result = await listProducts({
      page: 1,
      limit: 2,
    });

    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it("filters products by category", async () => {
    const result = await listProducts({
      categoryId: "cat_electronics",
    });

    expect(result.total).toBe(2);
    expect(
      result.products.every(
        (product) => product.categoryId === "cat_electronics",
      ),
    ).toBe(true);
  });

  it("filters products by minimum and maximum price", async () => {
    const result = await listProducts({
      minPrice: 20,
      maxPrice: 100,
    });

    expect(result.total).toBe(1);
    expect(result.products[0]?.id).toBe("prod_headphones");
  });

  it("searches product titles and descriptions", async () => {
    const result = await listProducts({
      search: "headphones",
    });

    expect(result.total).toBe(1);
    expect(result.products[0]?.id).toBe("prod_headphones");
  });

  it("returns a product by ID", async () => {
    const product = await getProductById("prod_headphones");

    expect(product).not.toBeNull();
    expect(product?.title).toBe("Wireless Headphones");
    expect(product?.rating.average).toBe(4.5);
  });

  it("returns null for a missing product", async () => {
    const product = await getProductById("prod_missing");

    expect(product).toBeNull();
  });
});
