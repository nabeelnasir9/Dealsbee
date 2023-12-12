import { ProductModel } from "../models/index.js";
import mongoose from "mongoose";

export const ProductService = {
  getProducts: async ({ page = 1, limit = 10, ...query }) => {
    const skip = (page - 1) * limit;
    let pipeline = [];
    if (query) {
      if (query.category_id) {
        pipeline.push({
          $match: {
            category_id: mongoose.Types.ObjectId(query.category_id),
          },
        });
      }
      if (query.brand) {
        pipeline[0]["$match"]["product_details.brand"] = {
          $regex: new RegExp(query.brand, "i"),
        };
      }
      if (query.price?.lt || query.price?.gt) {
        const priceFilter = {};
        if (query.price?.lt) {
          priceFilter.$lt = +query.price?.lt;
        }
        if (query.price?.gt) {
          priceFilter.$gt = +query.price?.gt;
        }

        pipeline.push({
          $match: {
            price: priceFilter,
          },
        });
      }
      pipeline.push({ $skip: +skip });
      pipeline.push({ $limit: +limit });
    }
    try {
      const data = await ProductModel.aggregate(pipeline);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Record Fetched Successfully",
          data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Record Exits",
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
  getProductById: async (id) => {
    try {
      const data = await ProductModel.findById(id);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Product Fetched Successfully",
          data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Such Product Found",
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
  updateProduct: async (id, body) => {
    try {
      const data = await ProductModel.findById(id);
      if (data) {
        if (body.title) {
          data.title = body.title;
        }
        if (body.price) {
          data.price = body.price;
        }
        if (body.currency) {
          data.currency = body.currency;
        }
        if (body.rating) {
          data.rating = body.rating;
        }
        if (body.product_details) {
          data.product_details = {
            ...data.product_details,
            ...body.product_details,
          };
        }
        if (body.url) {
          data.url = body.url;
        }
        if (body.img_url) {
          data.img_url[0] = body.img_url;
        }

        await data.save();

        return {
          status: 200,
          message: "Successfull",
          response: "Product Updated Successfully",
          data: data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Product Exits",
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
  deleteProduct: async (id) => {
    try {
      const data = await ProductModel.findByIdAndDelete(id);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Product Deleted Successfully",
          data: { _id: data._id },
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Such Product Exits",
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
