import express from 'express';
import * as smartphoneController from './smartphoneController.js';

const router = express.Router();

router.get('/', smartphoneController.getSmartphones);
router.get('/:id', smartphoneController.getSmartphoneById);
router.post('/', smartphoneController.createSmartphone);
router.put('/:id', smartphoneController.updateSmartphone);
router.delete('/:id', smartphoneController.deleteSmartphone);

export default router;
