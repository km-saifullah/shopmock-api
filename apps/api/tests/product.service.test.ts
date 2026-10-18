import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectMongoDB, disconnectMongoDB } from "../src/database/mongodb";
import { Product } from "../src/modules/mock/products/product.model";
import {
  getProductById,
  listProducts,
} from "../src/modules/mock/products/product.service";

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

  it("returns the correct products on the second page", async () => {
    const result = await listProducts({
      page: 2,
      limit: 2,
    });

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_watch",
    ]);
    expect(result.total).toBe(3);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(2);
  });

  it("returns an empty product list for a page beyond the available results", async () => {
    const result = await listProducts({
      page: 5,
      limit: 2,
    });

    expect(result.products).toEqual([]);
    expect(result.total).toBe(3);
    expect(result.page).toBe(5);
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

  it("returns no products for a category with no matches", async () => {
    const result = await listProducts({
      categoryId: "cat_missing",
    });

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("filters products by minimum and maximum price", async () => {
    const result = await listProducts({
      minPrice: 20,
      maxPrice: 100,
    });

    expect(result.total).toBe(1);
    expect(result.products[0]?.id).toBe("prod_headphones");
  });

  it("filters products by minimum price only", async () => {
    const result = await listProducts({
      minPrice: 80,
    });

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_watch",
    ]);
    expect(result.total).toBe(1);
  });

  it("filters products by maximum price only", async () => {
    const result = await listProducts({
      maxPrice: 20,
    });

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_shirt",
    ]);
    expect(result.total).toBe(1);
  });

  it("returns no products when the price range matches nothing", async () => {
    const result = await listProducts({
      minPrice: 200,
      maxPrice: 300,
    });

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("searches product titles and descriptions", async () => {
    const result = await listProducts({
      search: "headphones",
    });

    expect(result.total).toBe(1);
    expect(result.products[0]?.id).toBe("prod_headphones");
  });

  it("searches case-insensitively", async () => {
    const result = await listProducts({
      search: "WIRELESS",
    });

    expect(result.total).toBe(1);
    expect(result.products[0]?.id).toBe("prod_headphones");
  });

  it("searches product brands", async () => {
    const result = await listProducts({
      search: "techfit",
    });

    expect(result.total).toBe(1);
    expect(result.products[0]?.id).toBe("prod_watch");
  });

  it("searches product tags", async () => {
    const result = await listProducts({
      search: "fitness",
    });

    expect(result.total).toBe(1);
    expect(result.products[0]?.id).toBe("prod_watch");
  });

  it("treats regex metacharacters in search input literally", async () => {
    const result = await listProducts({
      search: ".*",
    });

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("returns no products for a search with no matches", async () => {
    const result = await listProducts({
      search: "product-that-does-not-exist",
    });

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("treats whitespace-only search input as no search filter", async () => {
    const result = await listProducts({
      search: "   ",
    });

    expect(result.total).toBe(3);
    expect(result.products).toHaveLength(3);
  });

  it("sorts products by title in ascending order", async () => {
    const result = await listProducts({
      sortBy: "title",
      order: "asc",
    });

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_shirt",
      "prod_watch",
      "prod_headphones",
    ]);
  });

  it("sorts products by price in descending order", async () => {
    const result = await listProducts({
      sortBy: "price",
      order: "desc",
    });

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_watch",
      "prod_headphones",
      "prod_shirt",
    ]);
  });

  it("sorts products by rating in descending order", async () => {
    const result = await listProducts({
      sortBy: "rating",
      order: "desc",
    });

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_headphones",
      "prod_watch",
      "prod_shirt",
    ]);
  });

  it("sorts products by ID in ascending order by default", async () => {
    const result = await listProducts();

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_headphones",
      "prod_shirt",
      "prod_watch",
    ]);
  });

  it("uses product ID as a stable tie-breaker for equal prices", async () => {
    await Product.updateOne({ id: "prod_watch" }, { $set: { price: 79.99 } });

    const result = await listProducts({
      sortBy: "price",
      order: "asc",
    });

    expect(result.products.map((product) => product.id)).toEqual([
      "prod_shirt",
      "prod_headphones",
      "prod_watch",
    ]);

    expect(result.products[1].price).toBe(result.products[2].price);
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
