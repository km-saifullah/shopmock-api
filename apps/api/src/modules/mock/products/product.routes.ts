import { Router } from "express";
import { z } from "zod";

import { listProducts } from "./product.service";
import { productIdSchema, productListResponseSchema } from "./product.schema";

const productRouter = Router();

const productQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    categoryId: z.string().optional(),

    minPrice: z.coerce.number().min(0).optional(),

    maxPrice: z.coerce.number().min(0).optional(),

    search: z.string().trim().max(100).optional(),
  })
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    {
      message: "minPrice cannot be greater than maxPrice.",
      path: ["minPrice"],
    },
  )
  .superRefine((query, context) => {
    if (
      query.categoryId !== undefined &&
      !/^cat_[a-zA-Z0-9_-]+$/.test(query.categoryId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Invalid category ID.",
      });
    }
  });

productRouter.get("/", async (req, res, next) => {
  try {
    const query = productQuerySchema.parse(req.query);

    const result = await listProducts(query);

    const response = productListResponseSchema.parse({
      success: true,
      data: result.products,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });

    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

export { productRouter };
