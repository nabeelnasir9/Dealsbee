import mongoose from "mongoose";
const schema = mongoose.Schema({
  ladder: {
    type: mongoose.Schema.Types.Array,
    default: [],
  },
});
export const CategoryModel = mongoose.model("Category", schema);
