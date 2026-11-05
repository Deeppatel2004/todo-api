
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

describe("GET /todos", () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);

    expect(mongoose.connection.name).toBe("todo_test");

    // Register User A
    const email = `test-${Date.now()}@example.com`;

    const response = await request(app)
      .post("/auth/register")
      .send({
        email,
        password: "TestPassword123"
      });

    expect(response.status).toBe(201);

    token = response.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: GET all todos
  it("returns 200 and an array of todos", async () => {
    const response = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test 2: Create a todo
  it("creates a new todo", async () => {
    const response = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Learn automated testing"
      });

    expect(response.status).toBe(201);
    expect(response.body.text).toBe("Learn automated testing");
    expect(response.body.id).toBeDefined();
  });

  // Test 3: Update a todo
  it("updates a todo", async () => {
    const created = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Old todo"
      });

    const todoId = created.body.id;

    const response = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        done: true
      });

    expect(response.status).toBe(200);
    expect(response.body.done).toBe(true);
  });

  // Test 4: Delete a todo
  it("deletes a todo", async () => {
    const created = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Todo to delete"
      });

    const todoId = created.body.id;

    const response = await request(app)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  // Test 5: Reject request without token
  it("rejects a request without a token", async () => {
    const response = await request(app)
      .get("/todos");

    expect(response.status).toBe(401);
  });

  // Test 6: Reject request with invalid token
  it("rejects a request with an invalid token", async () => {
    const response = await request(app)
      .get("/todos")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });

  // Test 7: User A cannot access User B's todo
  it("prevents one user from accessing another user's todo", async () => {

    // Register User B
    const userB = await request(app)
      .post("/auth/register")
      .send({
        email: `userB-${Date.now()}@example.com`,
        password: "TestPassword123"
      });

    expect(userB.status).toBe(201);

    const tokenB = userB.body.token;

    // User B creates a todo
    const created = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        text: "User B private todo"
      });

    expect(created.status).toBe(201);

    const todoId = created.body.id;

    // User A tries to access User B's todo
    const response = await request(app)
      .get(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  // Test 8: User A cannot update User B's todo
it("prevents one user from updating another user's todo", async () => {

  // Register User B
  const userB = await request(app)
    .post("/auth/register")
    .send({
      email: `userB-${Date.now()}@example.com`,
      password: "TestPassword123"
    });

  expect(userB.status).toBe(201);

  const tokenB = userB.body.token;

  // User B creates a todo
  const created = await request(app)
    .post("/todos")
    .set("Authorization", `Bearer ${tokenB}`)
    .send({
      text: "User B private todo"
    });

  expect(created.status).toBe(201);

  const todoId = created.body.id;

  // User A tries to update User B's todo
  const response = await request(app)
    .patch(`/todos/${todoId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      done: true
    });

  expect(response.status).toBe(404);
});


// Test 9: User A cannot delete User B's todo
it("prevents one user from deleting another user's todo", async () => {
  // Register User B
  const userB = await request(app)
    .post("/auth/register")
    .send({
      email: `userB-${Date.now()}@example.com`,
      password: "TestPassword123"
    });

  expect(userB.status).toBe(201);

  const tokenB = userB.body.token;

  // User B creates a todo
  const created = await request(app)
    .post("/todos")
    .set("Authorization", `Bearer ${tokenB}`)
    .send({
      text: "User B private todo"
    });

  expect(created.status).toBe(201);

  const todoId = created.body.id;

  // User A tries to delete User B's todo
  const response = await request(app)
    .delete(`/todos/${todoId}`)
    .set("Authorization", `Bearer ${token}`)
    ;

  expect(response.status).toBe(404);
});

// Test 9b: User A cannot see User B's todo in the list
it("only returns the logged-in user's todos", async () => {
  // Register User B
  const userB = await request(app)
    .post("/auth/register")
    .send({
      email: `list-userB-${Date.now()}@example.com`,
      password: "TestPassword123"
    });

  expect(userB.status).toBe(201);

  const tokenB = userB.body.token;

  // User B creates a private todo
  await request(app)
    .post("/todos")
    .set("Authorization", `Bearer ${tokenB}`)
    .send({
      text: "User B secret todo"
    });

  // User A gets their todo list
  const response = await request(app)
    .get("/todos")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);

  // User A must not see User B's todo
  expect(
    response.body.some(todo => todo.text === "User B secret todo")
  ).toBe(false);
});


// Test 10: Reject invalid MongoDB ID
it("returns 404 for an invalid todo ID", async () => {
  const response = await request(app)
    .get("/todos/invalid-id")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(404);
});

// Test 11: Reject todo with empty text
it("rejects a todo with empty text", async () => {
  const response = await request(app)
    .post("/todos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      text: ""
    });

  expect(response.status).toBe(400);
});

// Test 12: Reject todo with missing text
it("rejects a todo when text is missing", async () => {
  const response = await request(app)
    .post("/todos")
    .set("Authorization", `Bearer ${token}`)
    .send({});

  expect(response.status).toBe(400);
});
});
