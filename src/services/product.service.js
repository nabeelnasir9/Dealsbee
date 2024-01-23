import { ScraperHelper } from "../helpers/scraper.helper.js";
import { ProductModel, CategoryModel } from "../models/index.js";
import mongoose from "mongoose";

export const ProductService = {
  getProducts: async ({ page = 1, limit = 10, ...query }) => {
    try {
      const skip = (page - 1) * limit;
      let pipeline = [];
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
          let resolution = query.resolution.replaceAll(":", " ").split(",");
          if (resolution.length > 0) {
            pipeline[0]["$match"]["product_details.resolution"] = {
              $in: resolution.map((resolution) => new RegExp(resolution, "i")),
            };
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
        // if (query.os?.length) {
        //   let os = query.os.replaceAll("-", " ").split(",");
        //   if (os.length > 0) {
        //     pipeline[0]["$match"]["product_details.operating system"] = {
        //       $in: os.map((os) => new RegExp(os, "i")),
        //     };
        //   }
        // }
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
        data[0].romCounts = [
          {
            _id: "512",
            count: rom_512_GbAndAbove,
            checked: false,
          },
          {
            _id: "256",
            count: rom_256_GbAndAbove,
            checked: false,
          },
          {
            _id: "128",
            count: rom_128_GbAndAbove,
            checked: false,
          },
          {
            _id: "64",
            count: rom_64_GbAndAbove,
            checked: false,
          },
          {
            _id: "32",
            count: rom_32_GbAndAbove,
            checked: false,
          },
        ];
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
        data[0].ramCounts = [
          {
            _id: "12",
            count: tvelweGbAndAboveRam,
            checked: false,
          },
          {
            _id: "8",
            count: eightGbAndAboveRam,
            checked: false,
          },
          {
            _id: "6",
            count: sixGbAndAboveRam,
            checked: false,
          },
          {
            _id: "4",
            count: fourGbAndAboveRam,
            checked: false,
          },
          {
            _id: "3",
            count: threeGbAndAboveRam,
            checked: false,
          },
          {
            _id: "2",
            count: twoGbAndAboveRam,
            checked: false,
          },
        ];

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
    try {
      const data = await ProductModel.findById();
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
