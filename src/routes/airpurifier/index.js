import express from 'express';
import * as airPurifierController from './airpurifierController.js';

const router = express.Router();

router.get('/', airPurifierController.getAirPurifiers);
router.get('/:id', airPurifierController.getAirPurifierById);
router.post('/', airPurifierController.createAirPurifier);
router.put('/:id', airPurifierController.updateAirPurifier);
router.delete('/:id', airPurifierController.deleteAirPurifier);

export default router;
