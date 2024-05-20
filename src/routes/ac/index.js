import express from 'express';
import * as acController from './acController.js';

const router = express.Router();

router.get('/', acController.getAirConditioners);
router.get('/:id', acController.getAirConditionerById);
router.post('/', acController.createAirConditioner);
router.put('/:id', acController.updateAirConditioner);
router.delete('/:id', acController.deleteAirConditioner);

export default router;
