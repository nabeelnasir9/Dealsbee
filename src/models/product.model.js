import mongoose from "mongoose";
const schema = mongoose.Schema(
  {
    supc: { type: String },
    title: { type: String, required: true },
    asin: { type: String },
    price: { type: Number, float: true },
    currency: { type: String },
    rating: { type: Number, float: true },
    product_details: { type: mongoose.Schema.Types.Mixed },
    store: { type: String },
    productId: { type: String },
    likeRate :{ type: Number, float:true , default:0}, 
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
