import express from 'express';
import * as refrigeratorController from './refrigeratorController.js';

const router = express.Router();

router.get('/', refrigeratorController.getRefrigerators);
router.get('/:id', refrigeratorController.getRefrigeratorById);
router.post('/', refrigeratorController.createRefrigerator);
router.put('/:id', refrigeratorController.updateRefrigerator);
router.delete('/:id', refrigeratorController.deleteRefrigerator);

export default router;
