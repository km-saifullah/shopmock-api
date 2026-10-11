import { Router } from "express";
import { z } from "zod";

import { listCategories } from "./category.service";
import {
  categoryIdSchema,
  categoryListResponseSchema,
} from "./category.schema";

const categoryRouter = Router();

const categoryQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),

  parentId: z.union([categoryIdSchema, z.literal("null")]).optional(),
});

categoryRouter.get("/", async (req, res, next) => {
  try {
    const query = categoryQuerySchema.parse(req.query);

    const result = await listCategories({
      activeOnly: true,
      ...(query.search ? { search: query.search } : {}),
      ...(query.parentId !== undefined
        ? {
            parentId: query.parentId === "null" ? null : query.parentId,
          }
        : {}),
    });

    const response = categoryListResponseSchema.parse({
      success: true,
      data: result.categories,
      meta: {
        total: result.total,
      },
    });

    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
});

export { categoryRouter };
