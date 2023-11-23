import express from "express";
import controller from "./controller.js";
import { categoryValidationSchema } from "../../validations/index.js";
import { validate } from "../../middleware/index.js";

const router = express.Router();
router.post(
  "/",
  validate(categoryValidationSchema.post),
  controller.createCategory
);
router.get("/:id", controller.getCategory);
router.patch(
  "/:id",
  validate(categoryValidationSchema.patch),
  controller.patchCategory
);
router.delete("/:id", controller.deleteCategory);
export default router;
