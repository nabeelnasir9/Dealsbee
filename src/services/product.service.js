import { ProductModel, CategoryModel } from "../models/index.js";
import mongoose from "mongoose";

export const ProductService = {
  getProducts: async ({ page = 1, limit = 10, ...query }) => {
    const skip = (page - 1) * limit;
    let pipeline = [];
    if (!query.category_id) {
      query.category_id = "mobile";
    }
    const regex = new RegExp(query.category_id, "i");
    const categories =
      query.category == "all"
        ? await CategoryModel.find()
        : await CategoryModel.find({ name: regex });
    let categoryIds = [];
    if (query) {
      if (categories.length) {
        categoryIds = categories.map((item) => {
          return mongoose.Types.ObjectId(item._id);
        });
        pipeline.push({
          $match: {
            category_id: {
              $in: categoryIds,
            },
          },
        });
      }
      if (query.brand?.length) {
        let brands = query.brand.split(",");
        if (brands.length > 0) {
          pipeline[0]["$match"]["product_details.brand"] = {
            $in: brands.map((brand) => new RegExp(brand, "i")),
          };
        }
      }
      if (query.store?.length) {
        let stores = query.store.split(",");
        if (stores.length > 0) {
          pipeline[0]["$match"]["store"] = {
            $in: stores.map((store) => new RegExp(store, "i")),
          };
        }
      }
      if (query.resolution?.length) {
        let resolution = query.resolution.replaceAll("-", " ").split(",");
        if (resolution.length > 0) {
          pipeline[0]["$match"]["product_details.resolution"] = {
            $in: resolution.map((resolution) => new RegExp(resolution, "i")),
          };
        }
      }
      if (query.core?.length) {
        let core = query.core.replaceAll("-", " ").split(",");
        if (core.length > 0) {
          pipeline[0]["$match"]["product_details.processor core"] = {
            $in: core.map((core) => new RegExp(core, "i")),
          };
        }
      }
      if (query.os?.length) {
        let os = query.os.replaceAll("-", " ").split(",");
        if (os.length > 0) {
          pipeline[0]["$match"]["product_details.operating system"] = {
            $in: os.map((os) => new RegExp(os, "i")),
          };
        }
      }
      if (query.battery?.length) {
        let battery = query.battery.replaceAll("-", " ").split(",");
        if (battery.length > 0) {
          pipeline[0]["$match"]["product_details.battery capacity"] = {
            $in: battery.map((battery) => new RegExp(battery, "i")),
          };
        }
      }
      if (query.processorBrand?.length) {
        let processorBrand = query.processorBrand
          .replaceAll("-", " ")
          .split(",");
        if (processorBrand.length > 0) {
          pipeline[0]["$match"]["product_details.processor brand"] = {
            $in: processorBrand.map(
              (processorBrand) => new RegExp(processorBrand, "i")
            ),
          };
        }
      }
      if (query.ram?.length) {
        let rams = query.ram.split(",");
        if (rams.length > 0) {
          pipeline[0]["$match"]["product_details.ram"] = {
            $in: rams.map((ram) => +ram),
          };
        }
      }
      if (query.rom?.length) {
        let roms = query.rom.split(",");
        if (roms.length > 0) {
          pipeline[0]["$match"]["product_details.rom"] = {
            $in: roms.map((rom) => +rom),
          };
        }
      }
      if (query.minPrice || query.maxPrice) {
        const priceFilter = {};
        if (query.maxPrice) {
          priceFilter.$lt = +query.maxPrice;
        }
        if (query.minPrice) {
          priceFilter.$gt = +query.minPrice;
        }

        pipeline.push({
          $match: {
            price: priceFilter,
          },
        });
      }
      if (query.minRating || query.maxRating) {
        const ratingFilter = {};
        if (query.maxRating) {
          ratingFilter.$lt = +query.maxRating;
        }
        if (query.minRating) {
          ratingFilter.$gt = +query.minRating;
        }

        pipeline.push({
          $match: {
            price: ratingFilter,
          },
        });
      }
      pipeline.push({ $skip: +skip });
      pipeline.push({ $limit: +limit });
      pipeline.push({ $sort: { rating: -1 } });
    }
    try {
      const data = await ProductModel.aggregate([
        {
          $facet: {
            paginatedResults: pipeline,
            totalCount: [
              {
                $count: "count",
              },
            ],
            brandCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.brand" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            ramCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.ram": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.ram" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            romCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.rom": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.rom" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            resolutionCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.resolution": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.resolution" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            coreCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.processor core": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.processor core" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            processorBrandCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.processor brand": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.processor brand" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            osCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.operating system": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.operating system" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            batteryCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.battery capacity": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.battery capacity" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
            ],
            storeCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                },
              },
              {
                $group: {
                  _id: "$store",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$totalCount",
        },
        {
          $addFields: {
            totalCount: "$totalCount.count",
          },
        },
      ]);
      if (data && data.length > 0) {
        return {
          status: 200,
          message: "Successfull",
          response: "Record Fetched Successfully",
          data: data[0],
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
