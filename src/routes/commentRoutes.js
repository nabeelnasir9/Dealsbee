import express from "express";
import { CommentModel } from "../models/Comment.js";
import { ProductModel } from "../models/product.model.js";

const router = express.Router();

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

router.put('/products/:productId/comments/:commentId', async (req, res) => {
  const { content } = req.body;
  const { productId, commentId } = req.params;
  
  // Authorization logic here (ensure the requestor is the comment's author)

  try {
    const updatedComment = await CommentModel.findByIdAndUpdate(commentId, { content }, { new: true });
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
