import { ScraperHelper } from "../helpers/scraper.helper.js";
import { ProductModel, CategoryModel } from "../models/index.js";
import mongoose from "mongoose";

export const ProductService = {
  getProducts: async ({ page = 1, limit = 10, ...query }) => {
    try {
      const skip = (page - 1) * limit;
      let pipeline = [];
      const isAccesory = false;
      if (query.category_id?.toLowerCase()?.includes("accesories")) {
        isAccesory = true;
      }
      if (!query.category_id) {
        query.category_id = "mobile";
      } else {
        query.category_id = query.category_id.replaceAll("_", " ");
      }
      let regex,
        categories = [];
      if (query.category_id.includes(",")) {
        query.category_id = query.category_id.split(",");
        for (let i = 0; i < query.category_id.length; i++) {
          regex = new RegExp(query.category_id[i], "i");
          const tempCategory = await CategoryModel.find({ name: regex });
          if (tempCategory.length) {
            categories = [...categories, ...tempCategory];
          }
        }
      } else {
        regex = new RegExp(query.category_id, "i");
        categories =
          query.category == "all"
            ? await CategoryModel.find()
            : await CategoryModel.find({ name: regex });
      }
      let categoryIds = [],
        osTypeCounts = [];
      if (query) {
        if (categories.length) {
          let tCategory = categories;
          if (!isAccesory) {
            tCategory = tCategory.filter((item) => {
              if (item?.name?.toLowerCase()?.includes("accessor")) {
                return false;
              } else {
                return true;
              }
            });
          }
          categoryIds = tCategory.map((item) => {
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
          let resolution = query.resolution.replaceAll(":", " ").split(",");
          if (resolution.length > 0) {
            pipeline[0]["$match"]["product_details.resolution"] = {
              $in: resolution.map((resolution) => new RegExp(resolution, "i")),
            };
          }
        }
        if (query.type?.length) {
          let types = query.type.split(",");
          if (types.includes("dual sim")) {
            pipeline[0]["$match"]["product_details.sim type"] = {
              $in: [new RegExp("dual", "i")],
            };
          }
          if (types.includes("single sim")) {
            pipeline[0]["$match"]["product_details.sim type"] = {
              $in: [new RegExp("single", "i")],
            };
          }
          if (types.includes("smart phone")) {
            pipeline[0]["$match"]["$or"] = [
              {
                "product_details.generic_name": {
                  $in: [new RegExp("smart", "i")],
                },
              },
              {
                "product_details.browse type": {
                  $in: [new RegExp("smart", "i")],
                },
              },
            ];
          }
          if (types.includes("feature phone")) {
            pipeline[0]["$match"]["$or"] = [
              {
                "product_details.generic_name": {
                  $in: [new RegExp("feature", "i")],
                },
              },
              {
                "product_details.browse type": {
                  $in: [new RegExp("feature", "i")],
                },
              },
            ];
          }
        }
        if (query.available?.length) {
          let availables = query.available.split(",");

          if (availables.length > 0) {
            pipeline[0]["$match"]["product_details.available"] = {
              $in: availables.map((available) => new RegExp(available, "i")),
            };
            pipeline[0]["$match"]["$or"] = [
              { "product_details.available": { $exists: false } },
            ];
          }
        }

        if (query.aspectRatio?.length) {
          let aspectRatios = query.aspectRatio.replaceAll("_", ":").split(",");
          if (aspectRatios.length > 0) {
            pipeline[0]["$match"]["product_details.aspect_ratio"] = {
              $in: aspectRatios.map(
                (aspectRatio) => new RegExp(aspectRatio, "i")
              ),
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
        if (query.osType?.length) {
          let osType = query.osType.replaceAll("-", " ").split(",");
          if (osType.length > 0) {
            pipeline[0]["$match"]["product_details.operating system"] = {
              $in: osType.map((osType) => new RegExp(osType, "i")),
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
        if (query.connectivity?.length) {
          let connects = query.connectivity.split(",");
          if (connects.indexOf("otg") != -1) {
            pipeline[0]["$match"]["product_details.otg"] = true;
          }
          if (connects.indexOf("usb") != -1) {
            pipeline[0]["$match"]["product_details.usb"] = true;
          }
          if (connects.indexOf("irBlaster") != -1) {
            pipeline[0]["$match"]["product_details.irBlaster"] = true;
          }
          if (connects.indexOf("wifi") != -1) {
            pipeline[0]["$match"]["product_details.wifi"] = true;
          }
          if (connects.indexOf("nfc") != -1) {
            pipeline[0]["$match"]["product_details.nfc"] = true;
          }
          if (connects.indexOf("gps") != -1) {
            pipeline[0]["$match"]["product_details.gps"] = true;
          }
          if (connects.indexOf("2G") != -1) {
            pipeline[0]["$match"]["product_details.2G"] = true;
          }
          if (connects.indexOf("3G") != -1) {
            pipeline[0]["$match"]["product_details.3G"] = true;
          }
          if (connects.indexOf("4G") != -1) {
            pipeline[0]["$match"]["product_details.4G"] = true;
          }
          if (connects.indexOf("5G") != -1) {
            pipeline[0]["$match"]["product_details.5G"] = true;
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
        if (query.ipRating?.length) {
          let ipRatings = query.ipRating.split(",");
          if (ipRatings.length > 0) {
            pipeline[0]["$match"]["product_details.ip_rating"] = {
              $in: ipRatings.map((ipRating) => +ipRating),
            };
          }
        }
        if (query.refreshRate?.length) {
          let refreshRates = query.refreshRate.split(",");
          if (refreshRates.length > 0) {
            pipeline[0]["$match"]["product_details.refresh_rate"] = {
              $in: refreshRates.map((refreshRate) => +refreshRate),
            };
          }
        }
        if (!query.minPrice?.toString()) {
          query.minPrice = 5000;
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
              rating: ratingFilter,
            },
          });
        }

        if (query.discount) {
          let discountRange = {};
          const discount = query.discount.split(",");

          if (discount.indexOf("10") !== -1) {
            discountRange = { $gte: 10 };
          } else if (discount.indexOf("20") !== -1) {
            discountRange = { $gte: 20 };
          } else if (discount.indexOf("30") !== -1) {
            discountRange = { $gte: 30 };
          } else if (discount.indexOf("40") !== -1) {
            discountRange = { $gte: 40 };
          }
          pipeline[0]["$match"]["product_details.discount_percentage"] =
            discountRange;
        }
        if (query.ram) {
          let ramRange = {};
          const rams = query.ram.split(",");

          if (rams.indexOf("2") !== -1) {
            ramRange = { $gte: 2 };
          } else if (rams.indexOf("3") !== -1) {
            ramRange = { $gte: 3 };
          } else if (rams.indexOf("4") !== -1) {
            ramRange = { $gte: 4 };
          } else if (rams.indexOf("6") !== -1) {
            ramRange = { $gte: 6 };
          } else if (rams.indexOf("8") !== -1) {
            ramRange = { $gte: 8 };
          } else if (rams.indexOf("12") !== -1) {
            ramRange = { $gte: 12 };
          }
          pipeline[0]["$match"]["product_details.ram"] = ramRange;
        }
        if (query.rearCamera) {
          let rearCameraRange = {};
          const rearCameras = query.rearCamera.split(",");

          if (rearCameras.indexOf("rear camera") !== -1) {
            pipeline[0]["$match"]["product_details.rear_camera"] = true;
          }
          if (rearCameras.indexOf("rear camera dual") !== -1) {
            pipeline[0]["$match"]["product_details.rear_camera_dual"] = true;
          }

          if (rearCameras.indexOf("5") !== -1) {
            rearCameraRange = { $gte: 5 };
          } else if (rearCameras.indexOf("8") !== -1) {
            rearCameraRange = { $gte: 8 };
          } else if (rearCameras.indexOf("12") !== -1) {
            rearCameraRange = { $gte: 12 };
          } else if (rearCameras.indexOf("16") !== -1) {
            rearCameraRange = { $gte: 16 };
          } else if (rearCameras.indexOf("32") !== -1) {
            rearCameraRange = { $gte: 32 };
          } else if (rearCameras.indexOf("12") !== -1) {
            rearCameraRange = { $gte: 12 };
          }
          if (rearCameraRange?.$gte) {
            pipeline[0]["$match"]["product_details.rear_camera_size"] =
              rearCameraRange;
          }
        }
        if (query.frontCamera) {
          let frontCameraRange = {};
          const frontCameras = query.frontCamera.split(",");

          if (frontCameras.indexOf("front camera") !== -1) {
            pipeline[0]["$match"]["product_details.front_camera"] = true;
          }
          if (frontCameras.indexOf("front camera dual") !== -1) {
            pipeline[0]["$match"]["product_details.front_camera_dual"] = true;
          }

          if (frontCameras.indexOf("5") !== -1) {
            frontCameraRange = { $gte: 5 };
          } else if (frontCameras.indexOf("8") !== -1) {
            frontCameraRange = { $gte: 8 };
          } else if (frontCameras.indexOf("12") !== -1) {
            frontCameraRange = { $gte: 12 };
          } else if (frontCameras.indexOf("16") !== -1) {
            frontCameraRange = { $gte: 16 };
          } else if (frontCameras.indexOf("32") !== -1) {
            frontCameraRange = { $gte: 32 };
          }

          if (frontCameraRange?.$gte) {
            pipeline[0]["$match"]["product_details.front_camera_size"] =
              frontCameraRange;
          }
        }
        if (query.rom) {
          let romRange = {};
          const roms = query.rom.split(",");

          if (roms.indexOf("32") !== -1) {
            romRange = { $gte: 32 };
          } else if (roms.indexOf("64") !== -1) {
            romRange = { $gte: 64 };
          } else if (roms.indexOf("128") !== -1) {
            romRange = { $gte: 128 };
          } else if (roms.indexOf("256") !== -1) {
            romRange = { $gte: 256 };
          } else if (roms.indexOf("512") !== -1) {
            romRange = { $gte: 512 };
          }
          pipeline[0]["$match"]["product_details.rom"] = romRange;
        }
        if (query.os) {
          let osRange = {};
          const oss = query.os.split(",");

          if (oss.indexOf("10") !== -1) {
            osRange = { $gte: 10 };
          } else if (oss.indexOf("11") !== -1) {
            osRange = { $gte: 11 };
          } else if (oss.indexOf("12") !== -1) {
            osRange = { $gte: 12 };
          } else if (oss.indexOf("13") !== -1) {
            osRange = { $gte: 13 };
          } else if (oss.indexOf("14") !== -1) {
            osRange = { $gte: 14 };
          }
          pipeline[0]["$match"]["product_details.os_version"] = osRange;
          pipeline[0]["$match"]["product_details.os_type"] = {
            $regex: new RegExp("android", "i"),
          };
        }

        pipeline.push({ $skip: +skip });
        pipeline.push({ $limit: +limit });
        pipeline.push({ $sort: { rating: -1 } });
      }

      const countPipline = pipeline.filter((item) => {
        if (item?.["$match"]?.["category_id"] || item?.["$sort"]?.["rating"]) {
          return true;
        } else {
          return false;
        }
      });
      countPipline.push({
        $match: {
          price: { $gt: +query.minPrice },
        },
      });
      const data = await ProductModel.aggregate([
        {
          $facet: {
            paginatedResults: pipeline,
            totalCount: [
              ...countPipline,
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
                $match: {
                  count: { $gte: 20 },
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
              {
                $limit: 15,
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
                    $ne: 0,
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
                  value: { $toInt: "$_id" },
                  checked: false,
                },
              },
              // {
              //   $match: {
              //     count: { $gte: 20 },
              //   },
              // },
              {
                $sort: {
                  value: -1,
                  count: -1,
                  _id: -1,
                },
              },
              // {
              //   $limit: 15,
              // },
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
                    $ne: 0,
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
                  value: { $toInt: "$_id" },
                  checked: false,
                },
              },
              // {
              //   $match: {
              //     count: { $gte: 20 },
              //   },
              // },
              {
                $sort: {
                  value: -1,
                  count: -1,
                  _id: -1,
                },
              },
              // {
              //   $limit: 15,
              // },
            ],
            ipRatingCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.ip_rating": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: "nan",
                    $ne: "NaN",
                    $ne: "undefined",
                    $ne: 0,
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.ip_rating" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              // {
              //   $match: {
              //     count: { $gte: 20 },
              //   },
              // },
              {
                $sort: {
                  _id: -1,
                },
              },
              // {
              //   $limit: 15,
              // },
            ],
            refreshRateCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.refresh_rate": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.refresh_rate" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $match: {
                  count: { $gte: 30 },
                },
              },
              {
                $sort: {
                  _id: -1,
                },
              },
            ],
            otgCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.otg": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.otg": true,
                },
              },
              {
                $group: {
                  _id: "otg",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            usbCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.usb": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.usb": true,
                },
              },
              {
                $group: {
                  _id: "usb",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            irBlasterCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.irBlaster": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.irBlaster": true,
                },
              },
              {
                $group: {
                  _id: "irBlaster",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            wifiCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.wifi": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.wifi": true,
                },
              },
              {
                $group: {
                  _id: "wifi",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            nfcCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.nfc": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.nfc": true,
                },
              },
              {
                $group: {
                  _id: "nfc",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            gpsCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.gps": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.gps": true,
                },
              },
              {
                $group: {
                  _id: "usb",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            twoGCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.2G": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.2G": true,
                },
              },
              {
                $group: {
                  _id: "2G",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            threeGCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.3G": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.3G": true,
                },
              },
              {
                $group: {
                  _id: "3G",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            fourGCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.4G": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.4G": true,
                },
              },
              {
                $group: {
                  _id: "4G",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            fiveGCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.5G": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.5G": true,
                },
              },
              {
                $group: {
                  _id: "5G",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            rearCameraDualCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.rear_camera_dual": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.rear_camera_dual": true,
                },
              },
              {
                $group: {
                  _id: "rear camera dual",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            rearCameraCount: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.rear_camera": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.rear_camera": true,
                },
              },
              {
                $group: {
                  _id: "rear camera",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            rearCameraSizeCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.rear_camera_size": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.rear_camera_size" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  value: { $toInt: "$_id" },
                  checked: false,
                },
              },
              {
                $sort: {
                  value: -1,
                  count: -1,
                  _id: -1,
                },
              },
            ],
            frontCameraDualCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.front_camera_dual": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.front_camera_dual": true,
                },
              },
              {
                $group: {
                  _id: "front camera dual",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            frontCameraCount: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.front_camera": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                  "product_details.front_camera": true,
                },
              },
              {
                $group: {
                  _id: "front camera",
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  checked: false,
                },
              },
            ],
            frontCameraSizeCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.front_camera_size": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.front_camera_size" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  value: { $toInt: "$_id" },
                  checked: false,
                },
              },
              {
                $sort: {
                  value: -1,
                  count: -1,
                  _id: -1,
                },
              },
            ],
            percentageCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.discount_percentage": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                    $ne: 0,
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.discount_percentage" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  value: { $toInt: "$_id" },
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
                $match: {
                  count: { $gte: 20 },
                },
              },
              {
                $sort: {
                  count: -1,
                  _id: -1,
                },
              },
              {
                $limit: 15,
              },
            ],
            availableCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  $or: [
                    { "product_details.available": { $exists: true, $ne: "" } },
                    { "product_details.available": { $exists: false } },
                  ],
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.available" },
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
                $match: {
                  count: { $gte: 20 },
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
              {
                $limit: 15,
              },
            ],
            genericNameCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.generic_name": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.generic_name" },
                  count: { $sum: 1 },
                },
              },
              {
                $match: {
                  count: { $gte: 20 },
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
              {
                $limit: 15,
              },
            ],
            browseTypeCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.browse type": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.browse type" },
                  count: { $sum: 1 },
                },
              },
              {
                $match: {
                  count: { $gte: 20 },
                },
              },
              {
                $limit: 15,
              },
            ],
            simCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.sim type": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.sim type" },
                  count: { $sum: 1 },
                },
              },
              {
                $match: {
                  count: { $gte: 20 },
                },
              },
              {
                $limit: 15,
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
                    $ne: "na",
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
                $match: {
                  count: { $gte: 20 },
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
              {
                $limit: 15,
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
              // {
              //   $match: {
              //     count: { $gte: 20 },
              //   },
              // },
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
              // {
              //   $limit: 15,
              // },
            ],
            osVersionCounts: [
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
                  "product_details.os_type": {
                    $regex: new RegExp("android", "i"),
                  },
                  "product_details.os_version": {
                    $not: { $in: [NaN] },
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.os_version" },
                  count: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  // value: { $toInt: "$_id" },
                  checked: false,
                },
              },
              {
                $sort: {
                  // value:-1,
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
                    $ne: "0 mah",
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
                $match: {
                  count: { $gte: 20 },
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
              {
                $limit: 15,
              },
            ],
            aspectRatioCounts: [
              {
                $match: {
                  category_id: {
                    $in: categoryIds,
                  },
                  "product_details.aspect_ratio": {
                    $exists: true,
                    $ne: null,
                    $ne: "",
                  },
                },
              },
              {
                $group: {
                  _id: { $toLower: "$product_details.aspect_ratio" },
                  count: { $sum: 1 },
                },
              },
              // {
              //   $match: {
              //     count: { $gte: 20 },
              //   },
              // },
              {
                $addFields: {
                  checked: false,
                },
              },
              {
                $sort: {
                  count: -1,
                  // _id: -1,
                },
              },
              {
                $limit: 15,
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
                $match: {
                  count: { $gte: 20 },
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
            currentPage: parseInt(page),
          },
        },
      ]);

      if (data && data.length > 0) {
        let smartPhone = { _id: "smart phone", count: 0, checked: false };
        let featurePhone = { _id: "feature phone", count: 0, checked: false };
        let signleSim = { _id: "single sim", count: 0, checked: false };
        let dualSim = { _id: "dual sim", count: 0, checked: false };
        data[0].genericNameCounts.map((item) => {
          if (
            item._id?.replaceAll(" ", "")?.toLowerCase()?.includes("smartphone")
          ) {
            smartPhone.count = smartPhone.count + item.count;
          } else if (
            item._id
              ?.replaceAll(" ", "")
              ?.toLowerCase()
              ?.includes("featurephone")
          ) {
            featurePhone.count = featurePhone.count + item.count;
          }
        });
        data[0].browseTypeCounts.map((item) => {
          if (
            item._id?.replaceAll(" ", "")?.toLowerCase()?.includes("smartphone")
          ) {
            smartPhone.count = smartPhone.count + item.count;
          } else if (
            item._id
              ?.replaceAll(" ", "")
              ?.toLowerCase()
              ?.includes("featurephone")
          ) {
            featurePhone.count = featurePhone.count + item.count;
          }
        });

        data[0].simCounts.map((item) => {
          if (
            item._id?.replaceAll(" ", "")?.toLowerCase()?.includes("singlesim")
          ) {
            signleSim.count = signleSim.count + item.count;
          } else if (
            item._id?.replaceAll(" ", "")?.toLowerCase()?.includes("dualsim")
          ) {
            dualSim.count = dualSim.count + item.count;
          }
        });
        delete data[0].genericNameCounts;
        delete data[0].simCounts;
        delete data[0].browseTypeCounts;
        data[0].typeCounts = [];
        if (smartPhone.count) {
          data[0].typeCounts.push(smartPhone);
        }
        if (featurePhone.count) {
          data[0].typeCounts.push(featurePhone);
        }
        if (signleSim.count) {
          data[0].typeCounts.push(signleSim);
        }
        if (dualSim.count) {
          data[0].typeCounts.push(dualSim);
        }
        if (data[0]?.availableCounts?.length > 0) {
          let emptyDataIndex;
          data[0].availableCounts = data[0]?.availableCounts.map(
            (item, index, self) => {
              if (item._id == "available") {
                const emptyData = self.filter((item) => !item._id);
                if (emptyData?.length > 0) {
                  item.count = item.count + emptyData[0].count;
                  emptyDataIndex = self.indexOf(emptyData[0]);
                }
              }
              return item;
            }
          );
          if (emptyDataIndex?.toString() && emptyDataIndex > -1) {
            data[0].availableCounts.splice(emptyDataIndex, 1);
          }
        }
        let connectivityCounts = [];
        if (data[0].otgCounts?.length > 0 && data[0].otgCounts[0]?.count > 0) {
          connectivityCounts.push(data[0].otgCounts[0]);
        }
        if (data[0].usbCounts?.length > 0 && data[0].usbCounts[0]?.count > 0) {
          connectivityCounts.push(data[0].usbCounts[0]);
        }
        if (
          data[0].irBlasterCounts?.length > 0 &&
          data[0].irBlasterCounts[0]?.count > 0
        ) {
          connectivityCounts.push(data[0].irBlasterCounts[0]);
        }
        if (
          data[0].wifiCounts?.length > 0 &&
          data[0].wifiCounts[0]?.count > 0
        ) {
          connectivityCounts.push(data[0].wifiCounts[0]);
        }
        if (data[0].nfcCounts?.length > 0 && data[0].nfcCounts[0]?.count > 0) {
          connectivityCounts.push(data[0].nfcCounts[0]);
        }
        if (data[0].gpsCounts?.length > 0 && data[0].gpsCounts[0]?.count > 0) {
          connectivityCounts.push(data[0].gpsCounts[0]);
        }
        if (
          data[0].twoGCounts?.length > 0 &&
          data[0].twoGCounts[0]?.count > 0
        ) {
          connectivityCounts.push(data[0].twoGCounts[0]);
        }
        if (
          data[0].threeGCounts?.length > 0 &&
          data[0].threeGCounts[0]?.count > 0
        ) {
          connectivityCounts.push(data[0].threeGCounts[0]);
        }
        if (
          data[0].fourGCounts?.length > 0 &&
          data[0].fourGCounts[0]?.count > 0
        ) {
          connectivityCounts.push(data[0].fourGCounts[0]);
        }
        if (
          data[0].fiveGCounts?.length > 0 &&
          data[0].fiveGCounts[0]?.count > 0
        ) {
          connectivityCounts.push(data[0].fiveGCounts[0]);
        }
        delete data[0].otgCounts;
        delete data[0].usbCounts;
        delete data[0].irBlasterCounts;
        delete data[0].wifiCounts;
        delete data[0].nfcCounts;
        delete data[0].gpsCounts;
        delete data[0].twoGCounts;
        delete data[0].threeGCounts;
        delete data[0].fourGCounts;
        delete data[0].fiveGCounts;

        if (connectivityCounts?.length > 0) {
          data[0].connectivityCounts = connectivityCounts;
        }
        //React Camera
        let rear_camera_5_MpAndAbove = 0,
          rear_camera_8_MpAndAbove = 0,
          rear_camera_12_MpAndAbove = 0,
          rear_camera_16_MpAndAbove = 0,
          rear_camera_32_MpAndAbove = 0;
        data[0].rearCameraSizeCounts.map((rearCamera) => {
          if (rearCamera.value >= 32) {
            rear_camera_32_MpAndAbove =
              rear_camera_32_MpAndAbove + rearCamera.count;
            rear_camera_16_MpAndAbove = rear_camera_32_MpAndAbove;
          } else if (rearCamera.value >= 16 && rearCamera.value < 32) {
            rear_camera_16_MpAndAbove =
              rear_camera_16_MpAndAbove + rearCamera.count;
            rear_camera_12_MpAndAbove = rear_camera_16_MpAndAbove;
          } else if (rearCamera.value >= 12 && rearCamera.value < 16) {
            rear_camera_12_MpAndAbove =
              rear_camera_12_MpAndAbove + rearCamera.count;
            rear_camera_8_MpAndAbove = rear_camera_12_MpAndAbove;
          } else if (rearCamera.value >= 8 && rearCamera.value < 12) {
            rear_camera_8_MpAndAbove =
              rear_camera_8_MpAndAbove + rearCamera.count;
            rear_camera_5_MpAndAbove = rear_camera_8_MpAndAbove;
          } else if (rearCamera.value >= 5 && rearCamera.value < 8) {
            rear_camera_5_MpAndAbove =
              rear_camera_5_MpAndAbove + rearCamera.count;
          }
        });
        data[0].rearCameraCounts = [];
        if (data[0]?.rearCameraCount.length > 0) {
          data[0].rearCameraCounts.push({
            ...data[0].rearCameraCount[0],
            skipText: true,
          });
        }
        if (data[0]?.rearCameraDualCounts.length > 0) {
          data[0].rearCameraCounts.push({
            ...data[0].rearCameraDualCounts[0],
            skipText: true,
          });
        }
        delete data[0].rearCameraCount;
        delete data[0].rearCameraDualCounts;
        if (rear_camera_32_MpAndAbove) {
          data[0].rearCameraCounts.push({
            _id: "32",
            count: rear_camera_32_MpAndAbove,
            checked: false,
          });
        }
        if (rear_camera_16_MpAndAbove) {
          data[0].rearCameraCounts.push({
            _id: "16",
            count: rear_camera_16_MpAndAbove,
            checked: false,
          });
        }
        if (rear_camera_12_MpAndAbove) {
          data[0].rearCameraCounts.push({
            _id: "12",
            count: rear_camera_12_MpAndAbove,
            checked: false,
          });
        }
        if (rear_camera_8_MpAndAbove) {
          data[0].rearCameraCounts.push({
            _id: "8",
            count: rear_camera_8_MpAndAbove,
            checked: false,
          });
        }
        if (rear_camera_5_MpAndAbove) {
          data[0].rearCameraCounts.push({
            _id: "5",
            count: rear_camera_5_MpAndAbove,
            checked: false,
          });
        }

        //Rear Camera
        //Front Camera
        let front_camera_5_MpAndAbove = 0,
          front_camera_8_MpAndAbove = 0,
          front_camera_12_MpAndAbove = 0,
          front_camera_16_MpAndAbove = 0,
          front_camera_32_MpAndAbove = 0;
        data[0].frontCameraSizeCounts.map((frontCamera) => {
          if (frontCamera.value >= 32) {
            front_camera_32_MpAndAbove =
              front_camera_32_MpAndAbove + frontCamera.count;
            front_camera_16_MpAndAbove = front_camera_32_MpAndAbove;
          } else if (frontCamera.value >= 16 && frontCamera.value < 32) {
            front_camera_16_MpAndAbove =
              front_camera_16_MpAndAbove + frontCamera.count;
            front_camera_12_MpAndAbove = front_camera_16_MpAndAbove;
          } else if (frontCamera.value >= 12 && frontCamera.value < 16) {
            front_camera_12_MpAndAbove =
              front_camera_12_MpAndAbove + frontCamera.count;
            front_camera_8_MpAndAbove = front_camera_12_MpAndAbove;
          } else if (frontCamera.value >= 8 && frontCamera.value < 12) {
            front_camera_8_MpAndAbove =
              front_camera_8_MpAndAbove + frontCamera.count;
            front_camera_5_MpAndAbove = front_camera_8_MpAndAbove;
          } else if (frontCamera.value >= 5 && frontCamera.value < 8) {
            front_camera_5_MpAndAbove =
              front_camera_5_MpAndAbove + frontCamera.count;
          }
        });
        data[0].frontCameraCounts = [];
        if (data[0]?.frontCameraCount.length > 0) {
          data[0].frontCameraCounts.push({
            ...data[0].frontCameraCount[0],
            skipText: true,
          });
        }
        if (data[0]?.frontCameraDualCounts.length > 0) {
          data[0].frontCameraCounts.push({
            ...data[0].frontCameraDualCounts[0],
            skipText: true,
          });
        }
        delete data[0].frontCameraCount;
        delete data[0].frontCameraDualCounts;
        if (front_camera_32_MpAndAbove) {
          data[0].frontCameraCounts.push({
            _id: "32",
            count: front_camera_32_MpAndAbove,
            checked: false,
          });
        }
        if (front_camera_16_MpAndAbove) {
          data[0].frontCameraCounts.push({
            _id: "16",
            count: front_camera_16_MpAndAbove,
            checked: false,
          });
        }
        if (front_camera_12_MpAndAbove) {
          data[0].frontCameraCounts.push({
            _id: "12",
            count: front_camera_12_MpAndAbove,
            checked: false,
          });
        }
        if (front_camera_8_MpAndAbove) {
          data[0].frontCameraCounts.push({
            _id: "8",
            count: front_camera_8_MpAndAbove,
            checked: false,
          });
        }
        if (front_camera_5_MpAndAbove) {
          data[0].frontCameraCounts.push({
            _id: "5",
            count: front_camera_5_MpAndAbove,
            checked: false,
          });
        }

        //FrontCamera
        let rom_32_GbAndAbove = 0,
          rom_64_GbAndAbove = 0,
          rom_128_GbAndAbove = 0,
          rom_256_GbAndAbove = 0,
          rom_512_GbAndAbove = 0;
        data[0].romCounts.map((romCount) => {
          if (romCount.value >= 512) {
            rom_512_GbAndAbove = rom_512_GbAndAbove + romCount.count;
            rom_256_GbAndAbove = rom_512_GbAndAbove;
          } else if (romCount.value >= 256 && romCount.value < 512) {
            rom_256_GbAndAbove = rom_256_GbAndAbove + romCount.count;
            rom_128_GbAndAbove = rom_256_GbAndAbove;
          } else if (romCount.value >= 128 && romCount.value < 256) {
            rom_128_GbAndAbove = rom_128_GbAndAbove + romCount.count;
            rom_64_GbAndAbove = rom_128_GbAndAbove;
          } else if (romCount.value >= 64 && romCount.value < 128) {
            rom_64_GbAndAbove = rom_64_GbAndAbove + romCount.count;
            rom_32_GbAndAbove = rom_64_GbAndAbove;
          } else if (romCount.value >= 32 && romCount.value < 64) {
            rom_32_GbAndAbove = rom_32_GbAndAbove + romCount.count;
          }
        });
        data[0].romCounts = [];
        if (rom_512_GbAndAbove > 0) {
          data[0].romCounts.push({
            _id: "512",
            count: rom_512_GbAndAbove,
            checked: false,
          });
        }
        if (rom_256_GbAndAbove > 0) {
          data[0].romCounts.push({
            _id: "256",
            count: rom_256_GbAndAbove,
            checked: false,
          });
        }
        if (rom_128_GbAndAbove > 0) {
          data[0].romCounts.push({
            _id: "128",
            count: rom_128_GbAndAbove,
            checked: false,
          });
        }
        if (rom_64_GbAndAbove > 0) {
          data[0].romCounts.push({
            _id: "64",
            count: rom_64_GbAndAbove,
            checked: false,
          });
        }
        if (rom_32_GbAndAbove > 0) {
          data[0].romCounts.push({
            _id: "32",
            count: rom_32_GbAndAbove,
            checked: false,
          });
        }
        let twoGbAndAboveRam = 0,
          threeGbAndAboveRam = 0,
          fourGbAndAboveRam = 0,
          sixGbAndAboveRam = 0,
          eightGbAndAboveRam = 0,
          tvelweGbAndAboveRam = 0;
        data[0].ramCounts.map((ramCount) => {
          if (ramCount.value >= 12) {
            tvelweGbAndAboveRam = tvelweGbAndAboveRam + ramCount.count;
            eightGbAndAboveRam = tvelweGbAndAboveRam;
          } else if (ramCount.value >= 8 && ramCount.value < 12) {
            eightGbAndAboveRam = eightGbAndAboveRam + ramCount.count;
            sixGbAndAboveRam = eightGbAndAboveRam;
          } else if (ramCount.value >= 6 && ramCount.value < 8) {
            sixGbAndAboveRam = sixGbAndAboveRam + ramCount.count;
            fourGbAndAboveRam = sixGbAndAboveRam;
          } else if (ramCount.value >= 4 && ramCount.value < 6) {
            fourGbAndAboveRam = fourGbAndAboveRam + ramCount.count;
            threeGbAndAboveRam = fourGbAndAboveRam;
          } else if (ramCount.value >= 3 && ramCount.value < 4) {
            threeGbAndAboveRam = threeGbAndAboveRam + ramCount.count;
            twoGbAndAboveRam = threeGbAndAboveRam;
          } else if (ramCount.value >= 2 && ramCount.value < 3) {
            twoGbAndAboveRam = twoGbAndAboveRam + ramCount.count;
          }
        });
        data[0].ramCounts = [];
        if (tvelweGbAndAboveRam) {
          data[0].ramCounts.push({
            _id: "12",
            count: tvelweGbAndAboveRam,
            checked: false,
          });
        }
        if (eightGbAndAboveRam) {
          data[0].ramCounts.push({
            _id: "8",
            count: eightGbAndAboveRam,
            checked: false,
          });
        }
        if (sixGbAndAboveRam) {
          data[0].ramCounts.push({
            _id: "6",
            count: sixGbAndAboveRam,
            checked: false,
          });
        }
        if (fourGbAndAboveRam) {
          data[0].ramCounts.push({
            _id: "4",
            count: fourGbAndAboveRam,
            checked: false,
          });
        }
        if (threeGbAndAboveRam) {
          data[0].ramCounts.push({
            _id: "3",
            count: threeGbAndAboveRam,
            checked: false,
          });
        }
        if (twoGbAndAboveRam) {
          data[0].ramCounts.push({
            _id: "2",
            count: twoGbAndAboveRam,
            checked: false,
          });
        }

        let tenToTwenty = 0,
          twentyToThirty = 0,
          thirtyToFourty = 0,
          aboveFourty = 0;
        data[0].percentageCounts.map((percentageCount) => {
          if (percentageCount.value >= 10 && percentageCount.value < 20) {
            tenToTwenty = tenToTwenty + percentageCount.count;
          } else if (
            percentageCount.value >= 20 &&
            percentageCount.value < 30
          ) {
            twentyToThirty = tenToTwenty + percentageCount.count;
          } else if (
            percentageCount.value >= 30 &&
            percentageCount.value < 40
          ) {
            thirtyToFourty = tenToTwenty + percentageCount.count;
          } else if (percentageCount.value >= 40) {
            aboveFourty = tenToTwenty + percentageCount.count;
          }
          delete data[0].percentageCounts;
          data[0].discountCounts = [
            {
              _id: "10",
              count: tenToTwenty,
              checked: false,
            },
            {
              _id: "20",
              count: twentyToThirty,
              checked: false,
            },
            {
              _id: "30",
              count: thirtyToFourty,
              checked: false,
            },
            {
              _id: "40",
              count: aboveFourty,
              checked: false,
            },
          ];
        });

        let Android =
          data[0].osCounts.find((osCount) =>
            osCount._id.toLowerCase().includes("android")
          )?.count || 0;
        if (Android) {
          osTypeCounts.push({ _id: "android", count: Android, checked: false });
        }
        let iOS =
          data[0].osCounts.find((osCount) =>
            osCount._id.toLowerCase().includes("ios")
          )?.count || 0;
        if (iOS) {
          osTypeCounts.push({ _id: "ios", count: iOS, checked: false });
        }
        let Windows =
          data[0].osCounts.find((osCount) =>
            osCount._id.toLowerCase().includes("windows")
          )?.count || 0;
        if (Windows) {
          osTypeCounts.push({ _id: "windows", count: Windows, checked: false });
        }
        delete data[0].osCount;

        //Code for Android Filter
        data[0].osVersionCounts = data[0].osVersionCounts.filter(
          (osCount) => osCount._id
        );
        data[0].osVersionCounts = data[0].osVersionCounts.map((osCount) => {
          osCount._id = parseInt(osCount._id);
          return osCount;
        });
        data[0].osVersionCounts.sort((a, b) => {
          if (a._id < b._id) return 1;
          if (a._id > b._id) return -1;
          return 0;
        });
        let android_11_versionAndAbove = 0,
          android_12_versionAndAbove = 0,
          android_13_versionAndAbove = 0,
          android_14_versionAndAbove = 0;
        data[0].osVersionCounts.map((osVersion) => {
          if (osVersion._id >= 14) {
            android_14_versionAndAbove =
              android_14_versionAndAbove + osVersion.count;
            android_13_versionAndAbove = android_14_versionAndAbove;
          } else if (osVersion._id >= 13 && osVersion._id < 14) {
            android_13_versionAndAbove =
              android_13_versionAndAbove + osVersion.count;
            android_12_versionAndAbove = android_13_versionAndAbove;
          } else if (osVersion._id >= 12 && osVersion._id < 13) {
            android_12_versionAndAbove =
              android_12_versionAndAbove + osVersion.count;
            android_11_versionAndAbove = android_12_versionAndAbove;
          } else if (osVersion._id >= 11 && osVersion._id < 12) {
            android_11_versionAndAbove =
              android_11_versionAndAbove + osVersion.count;
          }
        });

        data[0].osVersionCounts = [
          {
            _id: "14",
            count: android_14_versionAndAbove,
            checked: false,
          },
          {
            _id: "13",
            count: android_13_versionAndAbove,
            checked: false,
          },
          {
            _id: "12",
            count: android_12_versionAndAbove,
            checked: false,
          },
          {
            _id: "11",
            count: android_11_versionAndAbove,
            checked: false,
          },
        ];

        data[0].osCounts = data[0].osVersionCounts;
        delete data[0].osVersionCounts;
        //Code for Android Filter
      }

      if (data && data.length > 0) {
        data[0]["osTypeCounts"] = osTypeCounts;
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
    const modifyProduct = (product) => {
      const { product_details } = product;
      let modify = false;
      let dual_camera_lens = product_details?.["dual camera lens"];
      let secondary_camera_available =
        product_details?.["secondary camera available"];
      let primary_camera_available =
        product_details?.["primary camera available"];
      let secondary_camera = product_details?.["secondary camera"];
      let primary_camera = product_details?.["primary camera"];
      try {
        if (dual_camera_lens?.includes("Primary")) {
          product.product_details.rear_camera_dual = true;
          modify = true;
        }
      } catch (error) {
        console.log("error");
      }
      try {
        if (dual_camera_lens?.includes("Secondary")) {
          product.product_details.front_camera_dual = true;
          modify = true;
        }
      } catch (error) {
        console.log("error");
      }
      try {
        if (secondary_camera_available?.includes("Yes")) {
          product.product_details.front_camera = true;
          modify = true;
        }
      } catch (error) {
        console.log("error");
      }
      try {
        if (secondary_camera?.includes("MP")) {
          let str = secondary_camera.split("MP")[0]?.trim();
          if (str && typeof parseInt(str) == "number" && !isNaN(str)) {
            product.product_details.front_camera_size = parseInt(str);
          }
          modify = true;
        }
      } catch (error) {
        console.log("error");
      }
      try {
        if (primary_camera?.includes("MP")) {
          let str = primary_camera.split("MP")[0]?.trim();
          if (str && typeof parseInt(str) == "number" && !isNaN(str)) {
            product.product_details.rear_camera_size = parseInt(str);
          }
          modify = true;
        }
      } catch (error) {
        console.log("error");
      }
      try {
        if (primary_camera_available?.includes("Yes")) {
          product.product_details.rear_camera = true;
          modify = true;
        }
      } catch (error) {
        console.log("error");
      }
      return modify ? product : null;
    };
    try {
      const data = await ProductModel.find({ store: "flipkart" });
      let count = 0;
      let products = [];
      for (let i = 0; i < data.length; i++) {
        products.push(data[i]);
      }
      for (let i = 0; i < products.length; i++) {
        const id = products[i]._id;
        let product = JSON.parse(JSON.stringify(products[i]));
        delete product._id;
        product = modifyProduct(product);
        if (product?.productId) {
          const isDone = await ProductModel.create(product);
          if (isDone) {
            const isExistArray = await ProductModel.find({
              productId: product.productId,
            });
            if (isExistArray?.length > 1) {
              await ProductModel.findByIdAndDelete(id);
              count = count + 1;
            }
          }
        }
      }
      const c = count;
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
