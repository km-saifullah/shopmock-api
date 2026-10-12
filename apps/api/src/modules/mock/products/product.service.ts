import type { FilterQuery } from "mongoose";

import { Product } from "./product.model";
import type { ProductDocument } from "./product.model";
import type { ProductResponse } from "./product.schema";

export interface ListProductsOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ListProductsResult {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listProducts(
  options: ListProductsOptions = {},
): Promise<ListProductsResult> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ProductDocument> = {};

  if (options.categoryId) {
    filter.categoryId = options.categoryId;
  }

  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    filter.price = {
      ...(options.minPrice !== undefined ? { $gte: options.minPrice } : {}),
      ...(options.maxPrice !== undefined ? { $lte: options.maxPrice } : {}),
    };
  }

  if (options.search?.trim()) {
    const escapedSearch = options.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
      { brand: { $regex: escapedSearch, $options: "i" } },
      { tags: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const [documents, total] = await Promise.all([
    Product.find(filter)
      .select(
        "-_id id title description price currency categoryId brand rating stock thumbnail images tags",
      )
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),

    Product.countDocuments(filter).exec(),
  ]);

  const products: ProductResponse[] = documents.map((document) => {
    const rating = document.rating;

    return {
      id: document.id,
      title: document.title,
      description: document.description,
      price: document.price,
      currency: document.currency,
      categoryId: document.categoryId,
      brand: document.brand ?? null,
      rating: {
        average: rating?.average ?? 0,
        count: rating?.count ?? 0,
      },
      stock: document.stock,
      thumbnail: document.thumbnail,
      images: document.images,
      tags: document.tags,
    };
  });

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
