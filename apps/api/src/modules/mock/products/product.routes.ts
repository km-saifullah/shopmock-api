import { Router } from "express";
import { ZodError, z } from "zod";

import { getProductById, listProducts } from "./product.service";

const productRouter = Router();

const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    categoryId: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    sortBy: z.enum(["price", "title", "rating", "id"]).default("id"),
    order: z.enum(["asc", "desc"]).default("asc"),
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
  );

productRouter.get("/", async (req, res, next) => {
  try {
    const query = listProductsQuerySchema.parse(req.query);

    const result = await listProducts({
      page: query.page,
      limit: query.limit,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      search: query.search,
      sortBy: query.sortBy,
      order: query.order,
    });

    res.status(200).json({
      success: true,
      data: result.products,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid product query parameters.",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      });

      return;
    }

    next(error);
  }
});

productRouter.get("/:id", async (req, res, next) => {
  try {
    const idSchema = z
      .string()
      .trim()
      .regex(/^prod_[a-zA-Z0-9_-]+$/);
    const id = idSchema.parse(req.params.id);

    const product = await getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "The requested product was not found.",
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid product ID.",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      });

      return;
    }

    next(error);
  }
});

export { productRouter };
