import express from "express";
import controller from "./controller.js";

const router = express.Router();
//Scrape Amazon Product By ASIN
router.post("/amazon", controller.scrapeAmazonProduct);
router.post("/amazon/list", controller.scrapeAmazonProductList);
router.post("/amazon/list/india", controller.scrapeAmazonProductListIndia);
//Scrape Amazon Mobiles
router.post("/amazon/mobiles", controller.scrapeAmazonMobiles);
//Scrape Amazon Mobiles
router.post("/amazon/laptops", controller.scrapeAmazonLaptops);
//Scrape Amazon Mobiles
router.post("/amazon/tablets", controller.scrapeAmazonTablets);
//Scrape Amazon Mobiles
router.post("/amazon/tv", controller.scrapeAmazonTelevision);
//Scrape Amazon Mobiles
router.post("/amazon/ac", controller.scrapeAmazonAC);
//Scrape Amazon Mobiles
router.post("/amazon/washingMachines", controller.scrapeAmazonWashingMachines);
router.post("/amazon/search", controller.searchAmazonProducts);
//Scrape Flipkart Product By Product URL
router.post("/flipkart", controller.scrapeFlipkartProduct);
//Scrape Flipkart Product List (Mobiles,PC, Laptop, Electronics)
router.post("/flipkart/list", controller.scrapeFlipkartProductList);
router.post("/snapdeal", controller.scrapeSnapdealProduct);
router.post("/snapdeal/list", controller.scrapeSnapdealProductList);
router.post("/snapdeal/categories", controller.scrapeSnapdealCategory);
export default router;
