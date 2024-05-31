import express from 'express';
import * as fitnessBandController from './fitnessbandController.js';

const router = express.Router();

router.get('/', fitnessBandController.getFitnessBands);
router.get('/:id', fitnessBandController.getFitnessBandById);
router.post('/', fitnessBandController.createFitnessBand);
router.put('/:id', fitnessBandController.updateFitnessBand);
router.delete('/:id', fitnessBandController.deleteFitnessBand);

export default router;
