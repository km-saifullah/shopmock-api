import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

import { app } from "../src/app";
import { disconnectMongoDB } from "../src/database/mongodb";

describe("Health routes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await disconnectMongoDB();
  });

  describe("GET /health/live", () => {
    it("returns 200 when the API process is running", async () => {
      const response = await request(app).get("/health/live");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("alive");
      expect(response.body.data.service).toBe("shopmock-api");
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe("GET /health/ready", () => {
    it("returns 503 when MongoDB is disconnected", async () => {
      vi.spyOn(mongoose.connection, "readyState", "get").mockReturnValue(0);

      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("SERVICE_NOT_READY");
    });

    it("returns 200 when MongoDB is connected", async () => {
      vi.spyOn(mongoose.connection, "readyState", "get").mockReturnValue(1);

      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("ready");
      expect(response.body.data.database).toBe("connected");
    });
  });
});
