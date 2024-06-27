import { Router } from 'express';
const router = Router();
import { Schema, model } from 'mongoose';

const popularProductsSchema = new Schema({}, { strict: false });
const PopularProducts = model('PopularProducts', popularProductsSchema, 'PopularProducts');

router.get('/', async (req, res) => {
    try {
        const products = await PopularProducts.aggregate([{ $sample: { size: 20 } }]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
