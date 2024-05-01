import {} from "dotenv/config";
import express from "express";
import loaders from "./loaders/index.js";
import config from "./config/index.js";
import thread from "./thread/index.js";
import cron from "node-cron";
import { ScraperService } from "./services/index.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import productsRoute from "./routes/products.js";
import blogsRouter from "./routes/blogs.js";
import smartphoneRoutes from "./routes/smartphone/index.js";
cron.schedule(
  `${config.env.cronMinute} ${config.env.cronHour} ${config.env.cronDayOfMonth} ${config.env.cronMonth} ${config.env.cronDayOfWeek}`,
  async () => {}
);
cron.schedule("0 0 * * *", async () => {
  await ScraperService.scrapeAmazonProductList();
});
cron.schedule("0 0 * * *", async () => {
  await ScraperService.scrapeFlipkartProductList();
});

async function startServer() {
  const app = express();
  await loaders.init({ expressApp: app });

  const server = app.listen(config.env.port, () =>
    console.log(`Server Started ~ :${config.env.port}`)
  );

  process.on("uncaughtException", (err) => {
    console.log("uncaughtException! Shutting Down the Server...");
    console.log(err);

    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    console.log("unhandledRejection! Shutting Down the Server...");
    console.log(err);
    server.close(() => {
      process.exit(1);
    });
  });
  app.use("/api/users", userRoutes);
  console.log("Registering routes...");
  app.use("/api", commentRoutes);
  app.use("/api/products", productsRoute);
  app.use(blogsRouter);
  app.use(smartphoneRoutes);
  console.log("Routes registered.");
}

await startServer();
