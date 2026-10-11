import { z } from "zod";

export const categoryIdSchema = z
  .string()
  .regex(/^cat_[a-zA-Z0-9_-]+$/, "Invalid category ID.");

export const categoryResponseSchema = z.object({
  id: categoryIdSchema,
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120),
  description: z.string().max(1000),
  parentId: categoryIdSchema.nullable(),
  image: z.string().max(2048).nullable(),
  isActive: z.boolean(),
});

export const categoryListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(categoryResponseSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
  }),
});

export type CategoryResponse = z.infer<typeof categoryResponseSchema>;

export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;
