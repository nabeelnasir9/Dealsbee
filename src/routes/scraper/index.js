import express from "express";
import controller from "./controller.js";

const router = express.Router();
router.post("/amazon", controller.scrapeAmazonProduct);
router.post("/amazon/list", controller.scrapeAmazonProductList);
router.post("/amazon/search", controller.searchAmazonProducts);
router.post("/flipkart", controller.scrapeFlipkartProduct);
router.get("/products", controller.getProducts);
router.get("/product/:id", controller.getProductById);
router.patch("/product/:id", controller.updateProduct);
router.delete("/product/:id", controller.deleteProduct);
export default router;
