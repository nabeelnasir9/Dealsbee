import mongoose from "mongoose";
const schema = mongoose.Schema(
  {
    supc: { type: String },
    title: { type: String, required: true },
    asin: { type: String },
    price: { type: Number, float: true },
    currency: { type: String },
    rating: { type: String },
    product_details: { type: Object },
    store: { type: String },
    productId: { type: String },
    url: { type: String },
    img_url: {
      type: mongoose.Schema.Types.Array,
      default: [],
    },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  {
    timestamps: true,
  }
);
export const ProductModel = mongoose.model("Product", schema);
