import express from "express";
import controller from "./controller.js";

const router = express.Router();
router.post("/amazon", controller.scrapeAmazonProduct);
router.post("/amazon/list", controller.scrapeAmazonProductList);
router.post("/amazon/list/india", controller.scrapeAmazonProductListIndia);
router.post("/amazon/mobiles", controller.scrapeAmazonMobiles);
router.post("/amazon/laptops", controller.scrapeAmazonLaptops);
router.post("/amazon/tv", controller.scrapeAmazonTelevision);
router.post("/amazon/washingMachines", controller.scrapeAmazonWashingMachines);
router.post("/amazon/search", controller.searchAmazonProducts);
router.post("/flipkart", controller.scrapeFlipkartProduct);
router.post("/flipkart/list", controller.scrapeFlipkartProductList);
router.post("/snapdeal", controller.scrapeSnapdealProduct);
router.post("/snapdeal/list", controller.scrapeSnapdealProductList);
router.post("/snapdeal/categories", controller.scrapeSnapdealCategory);
export default router;
