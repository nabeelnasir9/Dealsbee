import express from "express";
import controller from "./controller.js";

const router = express.Router();
router.get("/", controller.getProducts);
router.get("/data", controller.getProductsData);
router.get("/upcoming", controller.getUpcomingProducts);
router.get("/:id", controller.getProductById);
router.patch("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);
export default router;
