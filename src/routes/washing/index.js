import express from 'express';
import * as washingMachineController from "./washingController.js";

const router = express.Router();

router.get('/', washingMachineController.getWashingMachines);
router.get('/:id', washingMachineController.getWashingMachineById);
router.post('/', washingMachineController.createWashingMachine);
router.put('/:id', washingMachineController.updateWashingMachine);
router.delete('/:id', washingMachineController.deleteWashingMachine);

export default router;