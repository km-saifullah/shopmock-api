import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../src/app";
import { connectMongoDB, disconnectMongoDB } from "../src/database/mongodb";
import { Product } from "../src/modules/mock/products/product.model";
import { Category } from "../src/modules/mock/categories/category.model";

describe("OpenAPI documentation", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});

    await Product.insertMany([
      {
        id: "prod_contract_test",
        title: "Contract Test Product",
        description: "A product used for OpenAPI contract validation.",
        price: 49.99,
        currency: "USD",
        categoryId: "cat_contract_test",
        brand: "ShopMock",
        rating: { average: 4.5, count: 10 },
        stock: 20,
        thumbnail: "https://example.com/product.png",
        images: ["https://example.com/product.png"],
        tags: ["test", "contract"],
      },
    ]);

    await Category.insertMany([
      {
        id: "cat_contract_test",
        name: "Contract Test Category",
        slug: "contract-test",
        description: "A category used for OpenAPI contract validation.",
        parentId: null,
        image: null,
        isActive: true,
      },
    ]);
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
    await disconnectMongoDB();
  });

  describe("GET /docs.json", () => {
    it("returns a valid OpenAPI specification", async () => {
      const response = await request(app).get("/docs.json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body.openapi).toBe("3.0.3");
      expect(response.body.info).toMatchObject({
        title: "ShopMock API",
        version: "1.0.0",
      });
    });

    it("documents the expected API endpoints", async () => {
      const response = await request(app).get("/docs.json");

      expect(response.status).toBe(200);

      const paths = Object.keys(response.body.paths ?? {});

      expect(paths).toContain("/health/live");
      expect(paths).toContain("/health/ready");
      expect(paths).toContain("/v1/products");
      expect(paths).toContain("/v1/products/{id}");
      expect(paths).toContain("/v1/categories");
      expect(paths).toContain("/v1/categories/{id}");
    });

    it("includes the expected API tags", async () => {
      const response = await request(app).get("/docs.json");

      expect(response.status).toBe(200);

      const tagNames = (response.body.tags ?? []).map(
        (tag: { name: string }) => tag.name,
      );

      expect(tagNames).toEqual(
        expect.arrayContaining(["Products", "Categories", "Health"]),
      );
    });

    it("defines reusable product, category, response, and error schemas", async () => {
      const response = await request(app).get("/docs.json");

      expect(response.status).toBe(200);

      const schemas = response.body.components?.schemas ?? {};

      expect(Object.keys(schemas)).toEqual(
        expect.arrayContaining([
          "Product",
          "Category",
          "ProductResponse",
          "ProductListResponse",
          "CategoryResponse",
          "CategoryListResponse",
          "ApiError",
        ]),
      );

      expect(schemas.Product.required).toEqual(
        expect.arrayContaining([
          "id",
          "title",
          "price",
          "currency",
          "categoryId",
          "rating",
          "stock",
          "thumbnail",
          "images",
          "tags",
        ]),
      );

      expect(schemas.Category.required).toEqual(
        expect.arrayContaining([
          "id",
          "name",
          "slug",
          "description",
          "parentId",
          "image",
          "isActive",
        ]),
      );

      expect(schemas.ApiError.required).toEqual(
        expect.arrayContaining(["success", "error"]),
      );

      expect(schemas.ApiError.properties.success.enum).toEqual([false]);
      expect(schemas.ApiError.properties.error.required).toEqual(
        expect.arrayContaining(["code", "message"]),
      );
    });

    it("documents product response schemas and pagination metadata", async () => {
      const response = await request(app).get("/docs.json");

      expect(response.status).toBe(200);

      const paths = response.body.paths;
      const listOperation = paths["/v1/products"].get;
      const detailOperation = paths["/v1/products/{id}"].get;

      expect(
        listOperation.responses["200"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ProductListResponse",
      });

      expect(
        listOperation.responses["400"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ApiError",
      });

      expect(
        detailOperation.responses["200"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ProductResponse",
      });

      expect(
        detailOperation.responses["400"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ApiError",
      });

      expect(
        detailOperation.responses["404"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ApiError",
      });

      const schemas = response.body.components.schemas;

      expect(schemas.ProductListResponse.properties.data.items).toEqual({
        $ref: "#/components/schemas/Product",
      });

      expect(schemas.ProductListResponse.properties.meta.required).toEqual([
        "total",
        "page",
        "limit",
        "totalPages",
      ]);

      expect(schemas.ProductResponse.properties.data).toEqual({
        $ref: "#/components/schemas/Product",
      });
    });

    it("documents category response schemas and error responses", async () => {
      const response = await request(app).get("/docs.json");

      expect(response.status).toBe(200);

      const paths = response.body.paths;
      const listOperation = paths["/v1/categories"].get;
      const detailOperation = paths["/v1/categories/{id}"].get;

      expect(
        listOperation.responses["200"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/CategoryListResponse",
      });

      expect(
        listOperation.responses["400"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ApiError",
      });

      expect(
        detailOperation.responses["200"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/CategoryResponse",
      });

      expect(
        detailOperation.responses["400"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ApiError",
      });

      expect(
        detailOperation.responses["404"].content["application/json"].schema,
      ).toEqual({
        $ref: "#/components/schemas/ApiError",
      });

      const schemas = response.body.components.schemas;

      expect(schemas.CategoryListResponse.properties.data.items).toEqual({
        $ref: "#/components/schemas/Category",
      });

      expect(schemas.CategoryListResponse.properties.meta.required).toEqual([
        "total",
      ]);

      expect(schemas.CategoryResponse.properties.data).toEqual({
        $ref: "#/components/schemas/Category",
      });
    });
  });

  describe("Runtime response contract", () => {
    it("returns product list responses with the documented structure", async () => {
      const response = await request(app).get("/v1/products");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: [
          {
            id: "prod_contract_test",
            title: "Contract Test Product",
            price: 49.99,
            currency: "USD",
            categoryId: "cat_contract_test",
            rating: { average: 4.5, count: 10 },
            stock: 20,
            thumbnail: "https://example.com/product.png",
            images: ["https://example.com/product.png"],
            tags: ["test", "contract"],
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });

      expect(response.body.data[0]).toHaveProperty("description");
      expect(response.body.data[0]).toHaveProperty("brand");
    });

    it("returns single product responses with the documented structure", async () => {
      const response = await request(app).get(
        "/v1/products/prod_contract_test",
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: "prod_contract_test",
        title: "Contract Test Product",
        price: 49.99,
        currency: "USD",
        categoryId: "cat_contract_test",
        rating: { average: 4.5, count: 10 },
        stock: 20,
      });
    });

    it("returns category list responses with the documented structure", async () => {
      const response = await request(app).get("/v1/categories");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: [
          {
            id: "cat_contract_test",
            name: "Contract Test Category",
            slug: "contract-test",
            description: "A category used for OpenAPI contract validation.",
            parentId: null,
            image: null,
            isActive: true,
          },
        ],
        meta: { total: 1 },
      });
    });

    it("returns single category responses with the documented structure", async () => {
      const response = await request(app).get(
        "/v1/categories/cat_contract_test",
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: "cat_contract_test",
        name: "Contract Test Category",
        slug: "contract-test",
        description: "A category used for OpenAPI contract validation.",
        parentId: null,
        image: null,
        isActive: true,
      });
    });

    it("returns documented error structures for invalid product queries", async () => {
      const response = await request(app).get("/v1/products?page=0");

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: expect.any(String),
        },
      });
    });

    it("returns documented error structures for missing products", async () => {
      const response = await request(app).get("/v1/products/prod_missing");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: expect.any(String),
        },
      });
    });

    it("returns documented error structures for invalid category IDs", async () => {
      const response = await request(app).get("/v1/categories/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: expect.any(String),
        },
      });
    });

    it("returns documented error structures for missing categories", async () => {
      const response = await request(app).get("/v1/categories/cat_missing");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "CATEGORY_NOT_FOUND",
          message: expect.any(String),
        },
      });
    });
  });

  describe("GET /docs", () => {
    it("serves the Swagger UI page", async () => {
      const response = await request(app).get("/docs/");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/html");
      expect(response.text).toContain(
        "<title>ShopMock API Documentation</title>",
      );
      expect(response.text).toContain('id="swagger-ui"');
    });
  });
});
