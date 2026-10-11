import type { InferSchemaType } from "mongoose";

import { Product } from "./product.model";

type ProductSeedInput = Omit<InferSchemaType<typeof Product.schema>, "_id">;

export const productSeedData: ProductSeedInput[] = [
  {
    id: "prod_wireless_headphones",
    title: "Wireless Headphones",
    description:
      "Over-ear wireless headphones with comfortable cushions and clear sound.",
    price: 79.99,
    currency: "USD",
    categoryId: "cat_electronics",
    brand: "SoundWave",
    rating: {
      average: 4.5,
      count: 128,
    },
    stock: 42,
    thumbnail: "https://placehold.co/600x400?text=Wireless+Headphones",
    images: [
      "https://placehold.co/600x400?text=Headphones+Front",
      "https://placehold.co/600x400?text=Headphones+Side",
    ],
    tags: ["audio", "wireless", "headphones"],
  },
  {
    id: "prod_smart_watch",
    title: "Smart Watch",
    description:
      "A lightweight smartwatch with activity tracking and notifications.",
    price: 129.99,
    currency: "USD",
    categoryId: "cat_electronics",
    brand: "TechFit",
    rating: {
      average: 4.3,
      count: 96,
    },
    stock: 25,
    thumbnail: "https://placehold.co/600x400?text=Smart+Watch",
    images: [
      "https://placehold.co/600x400?text=Smart+Watch+Front",
      "https://placehold.co/600x400?text=Smart+Watch+Band",
    ],
    tags: ["wearable", "fitness", "electronics"],
  },
  {
    id: "prod_cotton_tshirt",
    title: "Cotton T-Shirt",
    description: "A soft everyday cotton T-shirt with a regular fit.",
    price: 19.99,
    currency: "USD",
    categoryId: "cat_clothing",
    brand: "Everyday",
    rating: {
      average: 4.1,
      count: 74,
    },
    stock: 120,
    thumbnail: "https://placehold.co/600x400?text=Cotton+T-Shirt",
    images: [
      "https://placehold.co/600x400?text=T-Shirt+Front",
      "https://placehold.co/600x400?text=T-Shirt+Back",
    ],
    tags: ["clothing", "cotton", "casual"],
  },
  {
    id: "prod_running_shoes",
    title: "Running Shoes",
    description:
      "Lightweight running shoes designed for everyday training and walking.",
    price: 64.5,
    currency: "USD",
    categoryId: "cat_sports",
    brand: "Stride",
    rating: {
      average: 4.6,
      count: 153,
    },
    stock: 37,
    thumbnail: "https://placehold.co/600x400?text=Running+Shoes",
    images: [
      "https://placehold.co/600x400?text=Running+Shoes+Side",
      "https://placehold.co/600x400?text=Running+Shoes+Top",
    ],
    tags: ["shoes", "running", "fitness"],
  },
  {
    id: "prod_desk_lamp",
    title: "Adjustable Desk Lamp",
    description:
      "An adjustable LED desk lamp suitable for reading and home offices.",
    price: 34.99,
    currency: "USD",
    categoryId: "cat_home_garden",
    brand: "BrightHome",
    rating: {
      average: 4.2,
      count: 58,
    },
    stock: 18,
    thumbnail: "https://placehold.co/600x400?text=Desk+Lamp",
    images: [
      "https://placehold.co/600x400?text=Desk+Lamp+On",
      "https://placehold.co/600x400?text=Desk+Lamp+Off",
    ],
    tags: ["lighting", "home", "office"],
  },
  {
    id: "prod_javascript_guide",
    title: "JavaScript Programming Guide",
    description:
      "A practical introduction to JavaScript programming concepts and techniques.",
    price: 29.99,
    currency: "USD",
    categoryId: "cat_books",
    brand: "CodePress",
    rating: {
      average: 4.7,
      count: 211,
    },
    stock: 64,
    thumbnail: "https://placehold.co/600x400?text=JavaScript+Guide",
    images: ["https://placehold.co/600x400?text=JavaScript+Book+Cover"],
    tags: ["books", "programming", "javascript"],
  },
  {
    id: "prod_skincare_set",
    title: "Daily Skincare Set",
    description:
      "A simple skincare set containing everyday cleansing and moisturizing essentials.",
    price: 39.99,
    currency: "USD",
    categoryId: "cat_beauty",
    brand: "PureGlow",
    rating: {
      average: 4.4,
      count: 87,
    },
    stock: 31,
    thumbnail: "https://placehold.co/600x400?text=Skincare+Set",
    images: [
      "https://placehold.co/600x400?text=Cleanser",
      "https://placehold.co/600x400?text=Moisturizer",
    ],
    tags: ["skincare", "beauty", "personal-care"],
  },
  {
    id: "prod_garden_planter",
    title: "Ceramic Garden Planter",
    description:
      "A decorative ceramic planter for indoor plants and small garden spaces.",
    price: 24.99,
    currency: "USD",
    categoryId: "cat_home_garden",
    brand: "GreenNest",
    rating: {
      average: 4.0,
      count: 42,
    },
    stock: 22,
    thumbnail: "https://placehold.co/600x400?text=Garden+Planter",
    images: [
      "https://placehold.co/600x400?text=Planter+Front",
      "https://placehold.co/600x400?text=Planter+Side",
    ],
    tags: ["garden", "home", "plants"],
  },
];
