import { CategoryModel } from "../models/index.js";

export const CategoryService = {
  createCategory: async (body) => {
    try {
      let category = await CategoryModel.findOne({ amazon_id: body.amazon_id });
      if (category) {
        if (body.amazon_id) {
          category.amazon_id = body.amazon_id;
        }
        if (body.title) {
          category.title = body.title;
        }
        if (body.url) {
          category.url = body.url;
        }
        await category.save();
        return {
          status: 200,
          message: "Successfull",
          response: "Category Updated Successfully",
          data: category,
        };
      }
      category = await CategoryModel.create(body);
      if (category) {
        return {
          status: 200,
          message: "Successfull",
          response: "Category Created Successfully",
          data: category,
        };
      }
      throw {
        status: 400,
        message: "Failed",
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
  getCategory: async (id) => {
    try {
      const data = await CategoryModel.findById(id);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Category Fetched Successfully",
          data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Record Exits",
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
  patchCategory: async (id, body) => {
    try {
      const data = await CategoryModel.findById(id);
      if (data) {
        if (body.amazon_id) {
          data.amazon_id = body.amazon_id;
        }
        if (body.title) {
          data.title = body.title;
        }
        if (body.url) {
          data.url = body.url;
        }
        await data.save();
        return {
          status: 200,
          message: "Successfull",
          response: "Category Updated Successfully",
          data,
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Such Category Exits",
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
  deleteCategory: async (id) => {
    try {
      const data = await CategoryModel.findByIdAndDelete(id);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Category Deleted Successfully",
          data: { _id: data._id },
        };
      }
      return {
        status: 200,
        message: "Successfull",
        response: "No Such Category Exits",
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
