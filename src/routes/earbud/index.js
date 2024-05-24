import express from 'express';
import * as earbudController from './earbudController.js';

const router = express.Router();

router.get('/', earbudController.getEarbuds);
router.get('/:id', earbudController.getEarbudById);
router.post('/', earbudController.createEarbud);
router.put('/:id', earbudController.updateEarbud);
router.delete('/:id', earbudController.deleteEarbud);

export default router;
