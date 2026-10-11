import type { InferSchemaType } from "mongoose";

import { Category } from "./category.model";

type CategorySeedInput = Omit<InferSchemaType<typeof Category.schema>, "_id">;

export const categorySeedData: CategorySeedInput[] = [
  {
    id: "cat_electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices, accessories, and consumer technology.",
    parentId: null,
    image: "https://placehold.co/600x400?text=Electronics",
    isActive: true,
  },
  {
    id: "cat_clothing",
    name: "Clothing",
    slug: "clothing",
    description: "Clothing, apparel, and fashion accessories.",
    parentId: null,
    image: "https://placehold.co/600x400?text=Clothing",
    isActive: true,
  },
  {
    id: "cat_home_garden",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Furniture, home essentials, and garden products.",
    parentId: null,
    image: "https://placehold.co/600x400?text=Home+and+Garden",
    isActive: true,
  },
  {
    id: "cat_books",
    name: "Books",
    slug: "books",
    description: "Books and educational reading materials.",
    parentId: null,
    image: "https://placehold.co/600x400?text=Books",
    isActive: true,
  },
  {
    id: "cat_sports",
    name: "Sports",
    slug: "sports",
    description: "Sports equipment, fitness gear, and outdoor accessories.",
    parentId: null,
    image: "https://placehold.co/600x400?text=Sports",
    isActive: true,
  },
  {
    id: "cat_beauty",
    name: "Beauty",
    slug: "beauty",
    description: "Personal care, beauty products, and skincare essentials.",
    parentId: null,
    image: "https://placehold.co/600x400?text=Beauty",
    isActive: true,
  },
];
