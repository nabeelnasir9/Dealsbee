import express from "express";
import controller from "./controller.js";
import { scraperValidationSchema } from "../../validations/index.js";
import { validate } from "../../middleware/index.js";

const router = express.Router();
router.post("/", validate(scraperValidationSchema.post), controller.scrape);
router.post("/amazon", controller.scrapeAmazonProduct);
router.post("/flipkart", controller.scrapeFlipkartProduct);
router.get("/:id", controller.getRecord);
router.patch(
  "/:id",
  validate(scraperValidationSchema.patch),
  controller.patchRecord
);
router.delete("/:id", controller.deleteRecord);
export default router;
