import { InferSchemaType, Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      match: /^cat_[a-zA-Z0-9_-]+$/,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    parentId: {
      type: String,
      default: null,
      match: /^cat_[a-zA-Z0-9_-]+$/,
    },

    image: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: null,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    collection: "mock_categories",
    versionKey: false,
    strict: "throw",
    timestamps: false,
  },
);

categorySchema.index({ parentId: 1, isActive: 1 });

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

export const Category = model("Category", categorySchema);
