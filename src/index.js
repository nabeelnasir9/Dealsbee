import {} from "dotenv/config";
import express from "express";
import loaders from "./loaders/index.js";
import config from "./config/index.js";
import thread from "./thread/index.js";
import cron from "node-cron";

cron.schedule("* 30 4 * *", async () => {
  await thread();
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
}

await startServer();
