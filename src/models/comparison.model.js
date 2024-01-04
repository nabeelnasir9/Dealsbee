import mongoose from "mongoose";
const schema = mongoose.Schema(
  {
    title: { type: String },
    products: {
      type: [
        {
          product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          _id: false,
        },
      ],
    },
    type: { type: String },
  },
  {
    timestamps: true,
  }
);
export const ComparisonModel = mongoose.model("Comparison", schema);
