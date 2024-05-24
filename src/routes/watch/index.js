import express from 'express';
import * as smartwatchController from './watchController.js';

const router = express.Router();

router.get('/', smartwatchController.getSmartwatches);
router.get('/:id', smartwatchController.getSmartwatchById);
router.post('/', smartwatchController.createSmartwatch);
router.put('/:id', smartwatchController.updateSmartwatch);
router.delete('/:id', smartwatchController.deleteSmartwatch);

export default router;
