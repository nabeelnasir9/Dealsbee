import mongoose from "mongoose";
const schema = mongoose.Schema({
  title: { type: String, required: true },
  amazon_id: { type: String },
  url: { type: String },
});
export const CategoryModel = mongoose.model("Category", schema);
