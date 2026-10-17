import { Router } from "express";
import { z } from "zod";

import { getCategoryById, listCategories } from "./category.service";
import {
  categoryIdSchema,
  categoryListResponseSchema,
  categoryResponseSchema,
} from "./category.schema";

const categoryRouter = Router();

const categoryQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),

  parentId: z.union([categoryIdSchema, z.literal("null")]).optional(),
});

/**
 * @openapi
 * /v1/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: List product categories
 *     description: Returns active categories, with optional search and parent filtering.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search categories by name.
 *       - in: query
 *         name: parentId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by parent category ID. Use the literal "null" for root categories.
 *     responses:
 *       200:
 *         description: Categories retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 */
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

/**
 * @openapi
 * /v1/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get a product category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stable public category ID.
 *     responses:
 *       200:
 *         description: Category retrieved successfully.
 *       400:
 *         description: Invalid category ID.
 *       404:
 *         description: Category not found.
 */
categoryRouter.get("/:id", async (req, res, next) => {
  try {
    const id = categoryIdSchema.parse(req.params.id);
    const category = await getCategoryById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: "CATEGORY_NOT_FOUND",
          message: "The requested category was not found.",
        },
      });

      return;
    }

    const response = categoryResponseSchema.parse(category);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: unknown) {
    next(error);
  }
});

export { categoryRouter };
