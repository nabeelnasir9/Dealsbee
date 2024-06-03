import express from 'express';
import * as powerBankController from './powerbankController.js';

const router = express.Router();

router.get('/', powerBankController.getPowerBanks);
router.get('/:id', powerBankController.getPowerBankById);
router.post('/', powerBankController.createPowerBank);
router.put('/:id', powerBankController.updatePowerBank);
router.delete('/:id', powerBankController.deletePowerBank);

export default router;
