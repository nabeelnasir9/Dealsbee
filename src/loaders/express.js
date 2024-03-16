import express from "express";
import cors from "cors";
import helmet from "helmet";
import { protectedRouter, unProtectedRouter } from "../routes/index.js";
import userRoutes from '../routes/userRoutes.js';


export default async function expressLoader({ app }) {
  app.use("*", cors());
  app.use(helmet());

  app.use(express.json());
  app.use(express.urlencoded());

  app.use("/", unProtectedRouter);
  app.use("/", /*authenticate,*/ protectedRouter);
  app.use('/api/users', userRoutes);

}
