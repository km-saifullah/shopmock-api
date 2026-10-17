import path from "node:path";

import swaggerJsdoc from "swagger-jsdoc";

const sourceRoutes = path.resolve(process.cwd(), "src/modules/**/*.routes.ts");

const compiledRoutes = path.resolve(
  process.cwd(),
  "dist/modules/**/*.routes.js",
);

const openApiOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ShopMock API",
      version: "1.0.0",
      description:
        "A developer-friendly mock e-commerce API for products, categories, and other e-commerce resources.",
      contact: {
        name: "ShopMock API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Products",
        description: "Browse and retrieve mock products.",
      },
      {
        name: "Categories",
        description: "Browse and retrieve product categories.",
      },
      {
        name: "Health",
        description: "Check API and database health.",
      },
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          required: [
            "id",
            "title",
            "description",
            "price",
            "currency",
            "categoryId",
            "brand",
            "rating",
            "stock",
            "thumbnail",
            "images",
            "tags",
          ],
          properties: {
            id: {
              type: "string",
              pattern: "^prod_[a-zA-Z0-9_-]+$",
              example: "prod_headphones",
            },
            title: {
              type: "string",
              minLength: 1,
              maxLength: 200,
              example: "Wireless Headphones",
            },
            description: {
              type: "string",
              maxLength: 5000,
              example: "Wireless over-ear headphones.",
            },
            price: {
              type: "number",
              minimum: 0,
              example: 79.99,
            },
            currency: {
              type: "string",
              pattern: "^[A-Z]{3}$",
              example: "USD",
            },
            categoryId: {
              type: "string",
              pattern: "^cat_[a-zA-Z0-9_-]+$",
              example: "cat_electronics",
            },
            brand: {
              type: "string",
              nullable: true,
              maxLength: 100,
              example: "Example Audio",
            },
            rating: {
              type: "object",
              required: ["average", "count"],
              properties: {
                average: {
                  type: "number",
                  minimum: 0,
                  maximum: 5,
                  example: 4.5,
                },
                count: {
                  type: "integer",
                  minimum: 0,
                  example: 120,
                },
              },
            },
            stock: {
              type: "integer",
              minimum: 0,
              example: 25,
            },
            thumbnail: {
              type: "string",
              maxLength: 2048,
              format: "uri",
              example: "https://example.com/images/headphones.jpg",
            },
            images: {
              type: "array",
              maxItems: 20,
              items: {
                type: "string",
                maxLength: 2048,
                format: "uri",
              },
              example: ["https://example.com/images/headphones.jpg"],
            },
            tags: {
              type: "array",
              maxItems: 30,
              items: {
                type: "string",
                maxLength: 50,
              },
              example: ["audio", "wireless"],
            },
          },
        },
        Category: {
          type: "object",
          required: [
            "id",
            "name",
            "slug",
            "description",
            "parentId",
            "image",
            "isActive",
          ],
          properties: {
            id: {
              type: "string",
              pattern: "^cat_[a-zA-Z0-9_-]+$",
              example: "cat_electronics",
            },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Electronics",
            },
            slug: {
              type: "string",
              minLength: 1,
              maxLength: 120,
              example: "electronics",
            },
            description: {
              type: "string",
              maxLength: 1000,
              example: "Electronic devices and accessories.",
            },
            parentId: {
              type: "string",
              nullable: true,
              pattern: "^cat_[a-zA-Z0-9_-]+$",
              example: null,
            },
            image: {
              type: "string",
              nullable: true,
              maxLength: 2048,
              example: null,
            },
            isActive: {
              type: "boolean",
              example: true,
            },
          },
        },
        ProductResponse: {
          type: "object",
          required: ["success", "data"],
          properties: {
            success: {
              type: "boolean",
              enum: [true],
            },
            data: {
              $ref: "#/components/schemas/Product",
            },
          },
        },
        ProductListResponse: {
          type: "object",
          required: ["success", "data", "meta"],
          properties: {
            success: {
              type: "boolean",
              enum: [true],
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Product",
              },
            },
            meta: {
              type: "object",
              required: ["total", "page", "limit", "totalPages"],
              properties: {
                total: {
                  type: "integer",
                  minimum: 0,
                  example: 25,
                },
                page: {
                  type: "integer",
                  minimum: 1,
                  example: 1,
                },
                limit: {
                  type: "integer",
                  minimum: 1,
                  example: 10,
                },
                totalPages: {
                  type: "integer",
                  minimum: 0,
                  example: 3,
                },
              },
            },
          },
        },
        CategoryResponse: {
          type: "object",
          required: ["success", "data"],
          properties: {
            success: {
              type: "boolean",
              enum: [true],
            },
            data: {
              $ref: "#/components/schemas/Category",
            },
          },
        },
        CategoryListResponse: {
          type: "object",
          required: ["success", "data", "meta"],
          properties: {
            success: {
              type: "boolean",
              enum: [true],
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Category",
              },
            },
            meta: {
              type: "object",
              required: ["total"],
              properties: {
                total: {
                  type: "integer",
                  minimum: 0,
                  example: 8,
                },
              },
            },
          },
        },
        ApiError: {
          type: "object",
          required: ["success", "error"],
          properties: {
            success: {
              type: "boolean",
              enum: [false],
              example: false,
            },
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: {
                  type: "string",
                  example: "CATEGORY_NOT_FOUND",
                },
                message: {
                  type: "string",
                  example: "The requested category was not found.",
                },
                details: {
                  type: "array",
                  description:
                    "Optional validation details; present for errors that include field-level information.",
                  items: {
                    type: "object",
                    required: ["path", "message"],
                    properties: {
                      path: {
                        type: "string",
                        example: "id",
                      },
                      message: {
                        type: "string",
                        example: "Invalid category ID.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [sourceRoutes, compiledRoutes],
  failOnErrors: true,
};

export const openApiSpecification = swaggerJsdoc(openApiOptions);
