import mongoose from "mongoose";
const schema = mongoose.Schema({
  title: { type: String, required: true },
  asin: { type: String },
  price: { type: String },
  currency: { type: String },
  rating: { type: String },
  product_details: { type: Object },
  url: { type: String },
});
export const ProductModel = mongoose.model("Product", schema);
