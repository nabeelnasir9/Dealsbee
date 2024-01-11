import express from "express";

// routes
import scraperRoute from "./scraper/index.js";
import categoryRoute from "./category/index.js";
import productRoute from "./product/index.js";
import comparisonRoute from "./comparison/index.js";

const protectedRouter = express.Router();
const unProtectedRouter = express.Router();

// Protected Routes

// Un-Protected Routes
unProtectedRouter.get("/", (req, res) => {
  res.send("Hello World! Again");
});
unProtectedRouter.use("/scraper", scraperRoute);
unProtectedRouter.use("/category", categoryRoute);
unProtectedRouter.use("/product", productRoute);
unProtectedRouter.use("/comparison", comparisonRoute);

export { protectedRouter, unProtectedRouter };
