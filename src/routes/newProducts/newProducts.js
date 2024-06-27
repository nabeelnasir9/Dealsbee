import { Router } from 'express';
const router = Router();
import { Schema, model } from 'mongoose';

const newProductSchema = new Schema({}, { strict: false });
const NewProduct = model('NewProduct', newProductSchema, 'NewProducts');

router.get('/:type', async (req, res) => {
    const type = req.params.type;
    try {
        const products = await NewProduct.find({ type: type }).limit(12);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
