import { Router } from "express";
import { ZodError, z } from "zod";

import { getProductById, listProducts } from "./product.service";

const productRouter = Router();

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
 *           default: 1
 *         description: Page number.
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
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *                 - meta
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: prod_headphones
 *                       title:
 *                         type: string
 *                         example: Wireless Headphones
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                         example: 79.99
 *                       currency:
 *                         type: string
 *                         example: USD
 *                       categoryId:
 *                         type: string
 *                         example: cat_electronics
 *                       brand:
 *                         type: string
 *                         nullable: true
 *                       rating:
 *                         type: object
 *                         properties:
 *                           average:
 *                             type: number
 *                           count:
 *                             type: integer
 *                       stock:
 *                         type: integer
 *                       thumbnail:
 *                         type: string
 *                         format: uri
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           format: uri
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                 meta:
 *                   type: object
 *                   required:
 *                     - total
 *                     - page
 *                     - limit
 *                     - totalPages
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 8
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - error
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 *                       example: Invalid product query parameters.
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           path:
 *                             type: string
 *                           message:
 *                             type: string
 */
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
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: The requested product.
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: prod_headphones
 *                     title:
 *                       type: string
 *                       example: Wireless Headphones
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                       example: 79.99
 *                     currency:
 *                       type: string
 *                       example: USD
 *                     categoryId:
 *                       type: string
 *                       example: cat_electronics
 *                     brand:
 *                       type: string
 *                       nullable: true
 *                     rating:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: number
 *                         count:
 *                           type: integer
 *                     stock:
 *                       type: integer
 *                     thumbnail:
 *                       type: string
 *                       format: uri
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uri
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid product ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - error
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 *                       example: Invalid product ID.
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           path:
 *                             type: string
 *                           message:
 *                             type: string
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - error
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: PRODUCT_NOT_FOUND
 *                     message:
 *                       type: string
 *                       example: The requested product was not found.
 */
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
