import express from "express";
import controller from "./controller.js";

const router = express.Router();
router.post("/amazon", controller.scrapeAmazonProduct);
router.post("/amazon/list", controller.scrapeAmazonProductList);
router.post("/amazon/search", controller.searchAmazonProducts);
router.post("/flipkart", controller.scrapeFlipkartProduct);
export default router;
