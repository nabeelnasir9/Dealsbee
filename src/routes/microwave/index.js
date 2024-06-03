import express from 'express';
import * as microwaveController from './microwaveController.js';

const router = express.Router();

router.get('/', microwaveController.getMicrowaveOvens);
router.get('/:id', microwaveController.getMicrowaveOvenById);
router.post('/', microwaveController.createMicrowaveOven);
router.put('/:id', microwaveController.updateMicrowaveOven);
router.delete('/:id', microwaveController.deleteMicrowaveOven);

export default router;
