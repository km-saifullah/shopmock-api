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
      expect(paths).toContain("/v1/categories");
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
