import express from 'express';
import * as earphoneController from './earphoneController.js';

const router = express.Router();

router.get('/', earphoneController.getEarphones);
router.get('/:id', earphoneController.getEarphoneById);
router.post('/', earphoneController.createEarphone);
router.put('/:id', earphoneController.updateEarphone);
router.delete('/:id', earphoneController.deleteEarphone);

export default router;
