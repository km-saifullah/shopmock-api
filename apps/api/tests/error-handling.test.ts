import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../src/app";

describe("API error handling", () => {
  it("returns a consistent JSON response for unknown routes", async () => {
    const response = await request(app).get("/v1/unknown");

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "The requested endpoint does not exist.",
      },
    });
  });

  it("returns a JSON error for unknown routes outside the API prefix", async () => {
    const response = await request(app).get("/unknown");

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await request(app)
      .post("/v1/products")
      .set("Content-Type", "application/json")
      .send('{"title":');

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "The request body contains invalid JSON.",
      },
    });
  });
});
