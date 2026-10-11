import { z } from "zod";

export const productIdSchema = z
  .string()
  .regex(/^prod_[a-zA-Z0-9_-]+$/, "Invalid product ID.");

export const productRatingSchema = z.object({
  average: z.number().min(0).max(5),
  count: z.number().int().nonnegative(),
});

export const productResponseSchema = z.object({
  id: productIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  price: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  categoryId: z.string().regex(/^cat_[a-zA-Z0-9_-]+$/),
  brand: z.string().max(100).nullable(),
  rating: productRatingSchema,
  stock: z.number().int().nonnegative(),
  thumbnail: z.string().max(2048),
  images: z.array(z.string().max(2048)).max(20),
  tags: z.array(z.string().max(50)).max(30),
});

export const productListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productResponseSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
  }),
});

export type ProductResponse = z.infer<typeof productResponseSchema>;

export type ProductListResponse = z.infer<typeof productListResponseSchema>;
