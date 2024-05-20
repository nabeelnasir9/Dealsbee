import express from 'express';
import * as tvController from './tvController.js';

const router = express.Router();

router.get('/', tvController.getTVs);
router.get('/:id', tvController.getTVById);
router.post('/', tvController.createTV);
router.put('/:id', tvController.updateTV);
router.delete('/:id', tvController.deleteTV);

export default router;
