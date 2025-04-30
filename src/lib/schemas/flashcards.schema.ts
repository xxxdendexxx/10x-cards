import { z } from "zod";

export const listFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["created_at", "updated_at"]).default("created_at"),
  filter: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
});
