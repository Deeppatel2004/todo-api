import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

describe("Authentication API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);

    expect(mongoose.connection.name).toBe("todo_test");
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

// Test 1: Register a new user
it("registers a new user without exposing password data", async () => {
  const response = await request(app)
    .post("/auth/register")
    .send({
      email: `newuser-${Date.now()}@test.com`,
      password: "TestPassword123"
    });

  expect(response.status).toBe(201);
  expect(response.body.token).toBeDefined();

  expect(response.body.user.password).toBeUndefined();
  expect(response.body.user.passwordHash).toBeUndefined();
  expect(response.body.user.hashedPassword).toBeUndefined();
});

  // Test 2: Reject duplicate email
  it("rejects duplicate email", async () => {
    const email = `duplicate-${Date.now()}@test.com`;

    await request(app)
      .post("/auth/register")
      .send({
        email,
        password: "TestPassword123"
      });

    const response = await request(app)
      .post("/auth/register")
      .send({
        email,
        password: "TestPassword123"
      });

    expect(response.status).toBe(409);
  });

  // Test 3: Reject short password
  it("rejects a short password", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: `short-${Date.now()}@test.com`,
        password: "123"
      });

    expect(response.status).toBe(400);
  });

  // Test 4: Login with correct credentials
  it("logs in with correct credentials", async () => {
    const email = `login-${Date.now()}@test.com`;
    const password = "TestPassword123";

    await request(app)
      .post("/auth/register")
      .send({ email, password });

    const response = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  // Test 5: Reject incorrect password
  it("rejects an incorrect password", async () => {
    const email = `wrong-${Date.now()}@test.com`;

    await request(app)
      .post("/auth/register")
      .send({
        email,
        password: "TestPassword123"
      });

    const response = await request(app)
      .post("/auth/login")
      .send({
        email,
        password: "WrongPassword123"
      });

    expect(response.status).toBe(401);
  });

  // Test 6: Reject unknown email
  it("rejects an unknown email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: `unknown-${Date.now()}@test.com`,
        password: "TestPassword123"
      });

    expect(response.status).toBe(401);
  });
});