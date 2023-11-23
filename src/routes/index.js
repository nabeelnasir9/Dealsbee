import express from "express";

// routes
import scraperRoute from "./scraper/index.js";
import categoryRoute from "./category/index.js";

const protectedRouter = express.Router();
const unProtectedRouter = express.Router();

// Protected Routes

// Un-Protected Routes
unProtectedRouter.use("/scraper", scraperRoute);
unProtectedRouter.use("/category", categoryRoute);

export { protectedRouter, unProtectedRouter };
