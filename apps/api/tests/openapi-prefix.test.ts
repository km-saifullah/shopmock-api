import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";

describe("OpenAPI configurable API prefix", () => {
  let app: (typeof import("../src/app"))["app"];
  let disconnectMongoDB: (typeof import("../src/database/mongodb"))["disconnectMongoDB"];

  const originalApiPrefix = process.env.API_PREFIX;

  beforeAll(async () => {
    process.env.API_PREFIX = "/api/v2";

    // Ensure the app and environment configuration load with the custom prefix.
    vi.resetModules();

    const appModule = await import("../src/app");
    const databaseModule = await import("../src/database/mongodb");

    app = appModule.app;
    disconnectMongoDB = databaseModule.disconnectMongoDB;

    await databaseModule.connectMongoDB();
  });

  afterAll(async () => {
    if (disconnectMongoDB) {
      await disconnectMongoDB();
    }

    if (originalApiPrefix === undefined) {
      delete process.env.API_PREFIX;
    } else {
      process.env.API_PREFIX = originalApiPrefix;
    }
  });

  it("documents product and category routes under the configured prefix", async () => {
    const response = await request(app).get("/docs.json");

    expect(response.status).toBe(200);

    const paths = Object.keys(response.body.paths ?? {});

    expect(paths).toContain("/api/v2/products");
    expect(paths).toContain("/api/v2/products/{id}");
    expect(paths).toContain("/api/v2/categories");
    expect(paths).toContain("/api/v2/categories/{id}");

    expect(paths).not.toContain("/v1/products");
    expect(paths).not.toContain("/v1/categories");
  });

  it("keeps health endpoints outside the configured API prefix", async () => {
    const response = await request(app).get("/docs.json");

    expect(response.status).toBe(200);

    const paths = Object.keys(response.body.paths ?? {});

    expect(paths).toContain("/health/live");
    expect(paths).toContain("/health/ready");
    expect(paths).not.toContain("/api/v2/health/live");
    expect(paths).not.toContain("/api/v2/health/ready");
  });

  it("serves the live health endpoint without the API prefix", async () => {
    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
  });

  it("serves product routes under the configured prefix", async () => {
    const response = await request(app).get("/api/v2/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty("data");
  });
});
