import express from "express";
import * as laptopController from "./laptopController.js";

const router = express.Router();

router.get("/", laptopController.getLaptops);
router.get("/:id", laptopController.getLaptopById);
router.post("/", laptopController.createLaptop);
router.put("/:id", laptopController.updateLaptop);
router.delete("/:id", laptopController.deleteLaptop);

export default router;
