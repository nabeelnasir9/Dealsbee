import express from "express";
import { CommentModel } from "../models/Comment.js";
import { ProductModel } from "../models/product.model.js";

const router = express.Router();

// Existing endpoint to post a comment on a product
router.post("/products/:productId/comments", async (req, res) => {
  try {
    const { content } = req.body;
    const { productId } = req.params;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const comment = new CommentModel({ content, product: productId });
    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Existing endpoint to get all comments for a product
router.get("/products/:productId/comments", async (req, res) => {
  try {
    const { productId } = req.params;
    const comments = await CommentModel.find({ product: productId }).sort({
      createdAt: -1,
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to like a comment
router.post("/comments/:commentId/like", async (req, res) => {
    try {
        const comment = await CommentModel.findByIdAndUpdate(req.params.commentId, { $inc: { likes: 1 } }, { new: true });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to dislike a comment
router.post("/comments/:commentId/dislike", async (req, res) => {
    try {
        const comment = await CommentModel.findByIdAndUpdate(req.params.commentId, { $inc: { dislikes: 1 } }, { new: true });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
