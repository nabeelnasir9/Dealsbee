import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    likes: { type: Number, default: 0 }, // Added likes count with a default value of 0
    dislikes: { type: Number, default: 0 }, // Added dislikes count with a default value of 0
  },
  {
    timestamps: true,
  }
);

export const CommentModel = mongoose.model("Comment", commentSchema);
