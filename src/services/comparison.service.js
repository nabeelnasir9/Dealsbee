import { ComparisonModel } from "../models/index.js";
import mongoose from "mongoose";
export const ComparisonService = {
  createComparisons: async (body) => {
    try {
      let data = await ComparisonModel.findOne(body);
      if (!data) {
        data = await ComparisonModel.create(body);
      }
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Comparison Created Successfully",
          data: data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "Comparison Creation Failed",
        data: {},
      };
    } catch (error) {
      throw {
        status: 500,
        message: "Internal Server Error",
        response: "Database Error",
      };
    }
  },
  getComparisons: async ({ page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;
    try {
      const data = await ComparisonModel.aggregate([
        {
          $lookup: {
            from: "products",
            let: { productsIds: "$products.product_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$productsIds"] },
                },
              },
            ],
            as: "products",
          },
        },
        { $skip: +skip },
        { $limit: +limit },
      ]);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Comparison Fetched Successfully",
          data: data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Comparison Exits",
        data: {},
      };
    } catch (error) {
      throw {
        status: 500,
        message: "Internal Server Error",
        response: "Database Error",
      };
    }
  },
  getComparisonById: async (id) => {
    try {
      const data = await ComparisonModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "products",
            let: { productsIds: "$products.product_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$productsIds"] },
                },
              },
            ],
            as: "products",
          },
        },
      ]);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Comparison Fetched Successfully",
          data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Such Comparison Found",
        data: {},
      };
    } catch (error) {
      throw {
        status: 500,
        message: "Internal Server Error",
        response: "Database Error",
      };
    }
  },
  updateComparison: async (id, body) => {
    try {
      const data = await ComparisonModel.findById(id);
      if (data) {
        if (body.title) {
          data.title = body.title;
        }
        if (body.products) {
          data.products = body.products;
        }

        await data.save();

        return {
          status: 200,
          message: "Successfull",
          response: "Comparison Updated Successfully",
          data: data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Comparison Exits",
        data: {},
      };
    } catch (error) {
      throw {
        status: 500,
        message: "Internal Server Error",
        response: "Database Error",
      };
    }
  },
  deleteComparison: async (id) => {
    try {
      const data = await ComparisonModel.findByIdAndDelete(id);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Comparison Deleted Successfully",
          data: { _id: data._id },
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Such Comparison Exits",
        data: {},
      };
    } catch {
      throw {
        status: 500,
        message: "Internal Server Error",
        response: "Database Error",
      };
    }
  },
};
