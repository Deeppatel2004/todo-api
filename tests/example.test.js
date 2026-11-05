import { describe, it, expect } from "vitest";
import validateTodo from "../utils/validateTodo.js";

describe("validateTodo", () => {

  it("rejects an empty todo", () => {
    const result = validateTodo({ text: "   " });

    expect(result.ok).toBe(false);
  });

  it("accepts a valid todo", () => {
    const result = validateTodo({ text: "Learn testing" });

    expect(result.ok).toBe(true);
  });

  it("rejects a missing body", () => {
  const result = validateTodo(null);

  expect(result.ok).toBe(false);
});

it("rejects a number instead of text", () => {
  const result = validateTodo({ text: 123 });

  expect(result.ok).toBe(false);
});

it("accepts normal text", () => {
  const result = validateTodo({ text: "Buy milk" });

  expect(result.ok).toBe(true);
});

});