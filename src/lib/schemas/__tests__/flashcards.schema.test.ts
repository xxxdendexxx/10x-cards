import { describe, it, expect } from "vitest";
import { listFlashcardsQuerySchema } from "../flashcards.schema";

describe("listFlashcardsQuerySchema", () => {
  it("should validate and coerce valid query parameters", () => {
    const validInput = {
      page: "2",
      pageSize: "20",
      sortBy: "created_at",
      filter: "ai-full",
    };

    const result = listFlashcardsQuerySchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        page: 2,
        pageSize: 20,
        sortBy: "created_at",
        filter: "ai-full",
      });
    }
  });

  it("should use default values when parameters are missing", () => {
    const result = listFlashcardsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        page: 1,
        pageSize: 10,
        sortBy: "created_at",
        filter: undefined,
      });
    }
  });

  it("should reject invalid page numbers", () => {
    const invalidInput = {
      page: "0",
      pageSize: "20",
    };

    const result = listFlashcardsQuerySchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(["page"]);
    }
  });

  it("should reject invalid pageSize values", () => {
    const invalidInput = {
      page: "1",
      pageSize: "101", // Max is 100
    };

    const result = listFlashcardsQuerySchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(["pageSize"]);
    }
  });

  it("should reject invalid sortBy values", () => {
    const invalidInput = {
      sortBy: "invalid_field",
    };

    const result = listFlashcardsQuerySchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(["sortBy"]);
    }
  });

  it("should reject invalid filter values", () => {
    const invalidInput = {
      filter: "invalid_source",
    };

    const result = listFlashcardsQuerySchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(["filter"]);
    }
  });
});
