import type { FilterQuery } from "mongoose";

import { Category } from "./category.model";
import type { CategoryDocument } from "./category.model";
import type { CategoryResponse } from "./category.schema";

export interface ListCategoriesOptions {
  activeOnly?: boolean;
  parentId?: string | null;
  search?: string;
}

export async function listCategories(
  options: ListCategoriesOptions = {},
): Promise<{ categories: CategoryResponse[]; total: number }> {
  const filter: FilterQuery<CategoryDocument> = {};

  if (options.activeOnly !== false) {
    filter.isActive = true;
  }

  if (options.parentId !== undefined) {
    filter.parentId = options.parentId;
  }

  if (options.search?.trim()) {
    const escapedSearch = options.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const [documents, total] = await Promise.all([
    Category.find(filter)
      .select("-_id id name slug description parentId image isActive")
      .sort({ name: 1, id: 1 })
      .lean()
      .exec(),

    Category.countDocuments(filter).exec(),
  ]);

  const categories: CategoryResponse[] = documents.map((document) => ({
    id: document.id,
    name: document.name,
    slug: document.slug,
    description: document.description,
    parentId: document.parentId ?? null,
    image: document.image ?? null,
    isActive: document.isActive,
  }));

  return { categories, total };
}
