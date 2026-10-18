import { Router } from "express";
import { z } from "zod";

import { getProductById, listProducts } from "./product.service";
import { productIdSchema } from "./product.schema";

const productRouter = Router();

const MAX_PRODUCT_PAGE = 10_000;

/**
 * @openapi
 * /v1/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List products
 *     description: >
 *       Returns a paginated list of mock products. Supports filtering,
 *       text search, and sorting. This endpoint does not modify data.
 *       The minPrice value must not exceed maxPrice when both are provided.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10000
 *           default: 1
 *         description: Page number. Maximum 10000.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of products per page.
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Filter products by category ID.
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum product price, inclusive.
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum product price, inclusive.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search product titles, descriptions, brands, and tags.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - price
 *             - title
 *             - rating
 *             - id
 *           default: id
 *         description: Field used to sort the products.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: asc
 *         description: Sort direction.
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProductListResponse"
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiError"
 */
const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(MAX_PRODUCT_PAGE).default(1),
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
  } catch (error: unknown) {
    next(error);
  }
});

/**
 * @openapi
 * /v1/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by ID
 *     description: Returns a single mock product without modifying data.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^prod_[a-zA-Z0-9_-]+$'
 *         description: Product identifier, such as prod_headphones.
 *     responses:
 *       200:
 *         description: Product retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProductResponse"
 *       400:
 *         description: Invalid product ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiError"
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiError"
 */
productRouter.get("/:id", async (req, res, next) => {
  try {
    const id = productIdSchema.parse(req.params.id.trim());
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
  } catch (error: unknown) {
    next(error);
  }
});

export { productRouter };
