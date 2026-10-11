import { InferSchemaType, Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      match: /^prod_[a-zA-Z0-9_-]+$/,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
      match: /^[A-Z]{3}$/,
    },

    categoryId: {
      type: String,
      required: true,
      immutable: true,
      match: /^cat_[a-zA-Z0-9_-]+$/,
    },

    brand: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    rating: {
      average: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer.",
      },
    },

    thumbnail: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images: string[]) =>
          images.length <= 20 && images.every((image) => image.length <= 2048),
        message: "A product can have at most 20 images.",
      },
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) =>
          tags.length <= 30 && tags.every((tag) => tag.length <= 50),
        message: "A product can have at most 30 tags.",
      },
    },
  },
  {
    collection: "mock_products",
    versionKey: false,
    strict: "throw",
    timestamps: false,
  },
);

productSchema.index({ categoryId: 1, price: 1 });
productSchema.index({ title: "text", description: "text", brand: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product = model("Product", productSchema);
