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
import smartphoneRouter from "./routes/smartphone/index.js";
import tabletRouter from "./routes/tablet/index.js";
import laptopRouter from "./routes/laptop/index.js";
import tvRouter from "./routes/tv/index.js";
import acRouter from "./routes/ac/index.js";
import washingMachineRouter from "./routes/washing/index.js";
import earbudRouter from "./routes/earbud/index.js";
import earphoneRouter from "./routes/earphone/index.js";
import headphoneRouter from "./routes/headphone/index.js";
import refrigeratorRouter from "./routes/refrigerator/index.js";
import smartwatchRouter from "./routes/watch/index.js";
import fitnessBandRouter from "./routes/fitnessband/index.js";
import powerBankRouter from "./routes/powerbank/index.js";
import airPurifierRouter from "./routes/airpurifier/index.js";
import microwaveRouter from "./routes/microwave/index.js";

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
  app.use("/api/smartphones", smartphoneRouter);
  app.use("/api/tablets", tabletRouter);
  app.use("/api/laptops", laptopRouter);
  app.use("/api/televisions", tvRouter);
  app.use("/api/airconditioners", acRouter);
  app.use("/api/washingmachines", washingMachineRouter);
  app.use("/api/earbuds", earbudRouter);
  app.use("/api/earphones", earphoneRouter);
  app.use("/api/headphones", headphoneRouter);
  app.use("/api/refrigerators", refrigeratorRouter);
  app.use("/api/smartwatches", smartwatchRouter);
  app.use("/api/fitnessbands", fitnessBandRouter);
  app.use("/api/powerbanks", powerBankRouter);
  app.use("/api/airpurifiers", airPurifierRouter);
  app.use("/api/microwaves", microwaveRouter);

  console.log("Routes registered.");
}

await startServer();
