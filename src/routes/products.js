// import { Router } from 'express';
// const router = Router();
// import { ProductModel } from '../models/product.model.js';

// router.get('/search', async (req, res) => {
//   try {
//     const searchQuery = req.query.q;
//     const products = await ProductModel.find({
//       $text: { $search: searchQuery }
//     }).sort({
//       score: { $meta: "textScore" }
//     });
//     res.json(products);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// export default router;




import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/search', async (req, res) => {
  try {
    const { q: searchQuery, category } = req.query;
    let queryOptions = { $text: { $search: searchQuery } };

    if (category) {
      queryOptions.category_id = new ObjectId(category);
    }

    const products = await ProductModel.find(queryOptions).sort({
      score: { $meta: "textScore" }
    });

    res.json(products);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
