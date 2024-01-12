import { ComparisonModel, CategoryModel } from "../models/index.js";
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
  getComparisons: async ({ page = 1, limit = 10, ...query }) => {
    const skip = (page - 1) * limit;
    if (!query.category) {
      query.category = "mobile";
    } else {
      query.category = query.category.replaceAll("_", " ");
    }
    try {
      const aggregationPipeline = [
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
        {
          $match: {
            type: query.category,
          },
        },
        { $skip: +skip },
        { $limit: +limit },
      ];

      const data = await ComparisonModel.aggregate(aggregationPipeline);

      if (data.length > 0) {
        return {
          status: 200,
          message: "Successful",
          response: "Comparison Fetched Successfully",
          data: data,
        };
      } else {
        return {
          status: 200,
          message: "Successful",
          response: "No Comparison Exists",
          data: {},
        };
      }
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
      if (data[0]) {
        // if(data[0]?.popularity?.toString()){
        //   data[0].popularity =data[0].popularity+1;
        //   await data[0].save();
        // }
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
