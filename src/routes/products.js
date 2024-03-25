import { Router } from 'express';
const router = Router();
import { ProductModel } from '../models/product.model.js';

router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const products = await ProductModel.find({
      $text: { $search: searchQuery }
    }).sort({
      score: { $meta: "textScore" }
    });
    res.json(products);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
