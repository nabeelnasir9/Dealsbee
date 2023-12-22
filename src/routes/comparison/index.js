import express from "express";
import controller from "./controller.js";

const router = express.Router();
router.post("/", controller.createComparisons);
router.get("/", controller.getComparisons);
router.get("/:id", controller.getComparisonById);
router.patch("/:id", controller.updateComparison);
router.delete("/:id", controller.deleteComparison);
export default router;
