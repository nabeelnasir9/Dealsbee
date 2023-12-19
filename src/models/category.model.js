import mongoose from "mongoose";
const schema = mongoose.Schema({
  name: { type: String },
  ladder: {
    type: mongoose.Schema.Types.Array,
    default: [],
  },
});
export const CategoryModel = mongoose.model("Category", schema);
