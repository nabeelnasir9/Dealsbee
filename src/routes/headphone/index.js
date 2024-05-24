import express from 'express';
import * as headphoneController from './headphoneController.js';

const router = express.Router();

router.get('/', headphoneController.getHeadphones);
router.get('/:id', headphoneController.getHeadphoneById);
router.post('/', headphoneController.createHeadphone);
router.put('/:id', headphoneController.updateHeadphone);
router.delete('/:id', headphoneController.deleteHeadphone);

export default router;
