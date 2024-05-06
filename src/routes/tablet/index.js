import express from 'express';
import * as tabletController from './tabletController.js';

const router = express.Router();

router.get('/', tabletController.getTablets);
router.get('/:id', tabletController.getTabletById);
router.post('/', tabletController.createTablet);
router.put('/:id', tabletController.updateTablet);
router.delete('/:id', tabletController.deleteTablet);

export default router;
