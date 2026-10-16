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
  },
  apis: [sourceRoutes, compiledRoutes],
  failOnErrors: true,
};

export const openApiSpecification = swaggerJsdoc(openApiOptions);
