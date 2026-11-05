import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../server.js";

describe("GET /health", () => {
  it("returns 200 and health information", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.status).toBe("ok");
    expect(response.body.version).toBeDefined();
    expect(response.body.uptime).toBeDefined();
  });
});
