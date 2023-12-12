import config from "../config/index.js";
import { CategoryModel, ProductModel } from "../models/index.js";
import axios from "axios";
export const ScraperHelper = {
  scrapeAmazonProduct: async (productId) => {
    const oxylabsData =
      config.env.oxylabxUsername + ":" + config.env.oxylabsPassword;
    try {
      let buff = new Buffer(oxylabsData);
      let oxylabsConfig = buff.toString("base64");

      let data = JSON.stringify({
        source: "amazon_product",
        domain: "in",
        query: productId,
        parse: true,
        context: [
          {
            key: "autoselect_variant",
            value: true,
          },
        ],
      });

      let config = {
        method: "post",
        url: "https://realtime.oxylabs.io/v1/queries",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${oxylabsConfig}`,
        },
        data: data,
      };

      const response = await axios
        .request(config)
        .then(async (response) => {
          return response;
        })
        .catch((error) => {
          throw {
            status: error?.status ? error.status : 400,
            message: error.message ? error.message : "Error in OXYLABS API",
          };
        });
      if (
        response?.status == 200 &&
        response.data?.results?.length &&
        response.data.results[0]["content"]
      ) {
        const responseData = response.data.results[0]["content"];
        const ladder = responseData?.category[0]?.ladder;
        for (let i = 0; i < ladder.length; i++) {
          ladder[i]["amazon_id"] = ladder[i]["url"].split("node=")[1];
        }
        let category = await CategoryModel.findOne({ ladder });
        if (!category) {
          category = await CategoryModel.create({ ladder });
        }
        let img_url = responseData.images.length ? responseData.images : [];

        let productData = {
          title: responseData.product_name,
          asin: responseData.asin,
          price: parseFloat(responseData.price),
          currency: responseData.currency,
          rating: responseData.ratings,
          product_details: responseData.product_details,
          url: responseData.url,
          category_id: category._id,
          img_url,
        };
        let product;
        product = await ProductModel.findOne({ asin: productData.asin });
        if (!product) {
          product = await ProductModel.create(productData);
        } else {
          product = await ProductModel.updateOne(
            { asin: productData.asin },
            productData
          );
        }
        if (product) {
          response.data["saved_data"] = product;
        }
      }
      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: response?.data,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
};
