import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../src/app";

describe("OpenAPI documentation", () => {
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
