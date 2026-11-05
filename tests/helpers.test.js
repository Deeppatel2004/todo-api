import { describe, it, expect } from "vitest";

const {
  validateTodo,
  ownerFilter,
  toPublicTodo,
  isValidId,
  cleanPatch
} = require("../helpers");

describe("validateTodo", () => {
  it("accepts a normal todo", () => {
    expect(validateTodo({ text: "milk" }).ok).toBe(true);
  });

  it("rejects empty text", () => {
    expect(validateTodo({ text: "   " }).ok).toBe(false);
  });

  it("rejects missing text", () => {
    expect(validateTodo({}).ok).toBe(false);
  });

  it("rejects text that is not a string", () => {
    expect(validateTodo({ text: 123 }).ok).toBe(false);
  });

  describe("ownerFilter", () => {
  it("adds the user ID to the filter", () => {
    expect(ownerFilter("user123")).toEqual({
      owner: "user123"
    });
  });

  it("keeps existing filters and adds the owner", () => {
    expect(ownerFilter("user123", { done: true })).toEqual({
      done: true,
      owner: "user123"
    });
  });
});

describe("toPublicTodo", () => {
  it("converts a MongoDB document to a public todo", () => {
    const doc = {
      _id: "abc123",
      text: "Learn testing",
      done: false,
      owner: "user123"
    };

    expect(toPublicTodo(doc)).toEqual({
      id: "abc123",
      text: "Learn testing",
      done: false
    });
  });

  it("does not expose the owner field", () => {
    const doc = {
      _id: "abc123",
      text: "Learn testing",
      done: false,
      owner: "user123"
    };

    const result = toPublicTodo(doc);

    expect(result).not.toHaveProperty("owner");
  });
});

describe("isValidId", () => {
  it("accepts a valid 24-character MongoDB ID", () => {
    expect(isValidId("507f1f77bcf86cd799439011")).toBe(true);
  });

  it("rejects an invalid ID", () => {
    expect(isValidId("12345")).toBe(false);
  });

  it("rejects a non-hexadecimal ID", () => {
    expect(isValidId("zzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false);
  });
});

describe("cleanPatch", () => {
  it("accepts valid text and done changes", () => {
    expect(cleanPatch({
      text: "  Learn React  ",
      done: true
    })).toEqual({
      text: "Learn React",
      done: true
    });
  });

  it("ignores invalid fields", () => {
    expect(cleanPatch({
      text: "   ",
      done: "yes",
      owner: "user123"
    })).toEqual({});
  });

  it("returns an empty object for missing data", () => {
    expect(cleanPatch()).toEqual({});
  });
});

});