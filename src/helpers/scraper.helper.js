import config from "../config/index.js";
import { CategoryModel, ProductModel } from "../models/index.js";
import axios from "axios";
import puppeteer from "puppeteer";
export const ScraperHelper = {
  scrapeAmazonProduct: async (productId) => {
    const oxylabsData =
      config.env.oxylabxUsername + ":" + config.env.oxylabsPassword;
    try {
      let buff = new Buffer(oxylabsData);
      let oxylabsConfig = buff.toString("base64");

      let data = JSON.stringify({
        source: "amazon_product",
        domain: "com",
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
          price: responseData.price,
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
  scrapeFlipkartProduct: async (url, newPage) => {
    try {
      let page, browser;
      if (!newPage) {
        browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
        });
        page = await browser.newPage();
      } else {
        page = newPage;
      }
      if (!url) {
        await browser.close();
      }
      await page.goto(url, {
        waitUntil: "domcontentloaded",
      });

      const urlLink = await page.url();
      const asin = urlLink.split("pid=")[1]?.split("&")[0];

      const getElementText = async (selector) => {
        try {
          const element = await page.$eval(selector, (element) =>
            element ? element.innerText : null
          );
          return element;
        } catch (error) {
          return null;
        }
      };

      const getElementLink = async (selector) => {
        try {
          const element = await page.$$eval(selector, (element) =>
            element ? element.slice(0, 6)?.map((item) => item.src) : null
          );
          return element;
        } catch (error) {
          return null;
        }
      };

      const title = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > h1 > span"
      );

      let rating = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > div > span:nth-child(1) > div"
      );

      if (!rating) {
        rating = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(4) > div:nth-child(1) > div > span:nth-child(1) > div"
        );
      }
      let price = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
      );

      if (!price) {
        price = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(1) > div > div"
        );
      }

      const category_1 = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-child(2) > a"
      );
      const category_2 = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-child(3) > a"
      );

      const img_url = await getElementLink("ul li img");

      const prodDetails = await page.$$eval("table tbody tr", (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll("td");
          return Array.from(columns, (column) => column.innerText);
        });
      });

      let product_details = {};

      for (let i = 0; i < prodDetails.length; i++) {
        if (prodDetails[i]?.length?.toString() && prodDetails[i].length > 1) {
          product_details[prodDetails[i][0]] = prodDetails[i][1];
        }
      }

      const detailsLowerize = (obj) =>
        Object.keys(obj).reduce((acc, k) => {
          acc[k.toLowerCase()] = obj[k];
          return acc;
        }, {});
      product_details = detailsLowerize(product_details);
      let brand = "";
      if (!product_details.brand) {
        brand = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-last-child(2) > a"
        );
        if (brand) {
          const verifyBrand = await getElementText(
            "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-last-child(3) > a"
          );
          brand = brand.replace(verifyBrand, "");
          product_details.brand = brand;
        }
      }
      const ladder = [{ name: category_1 }, { name: category_2 }];
      let category = await CategoryModel.findOne({ ladder });
      if (!category) {
        category = await CategoryModel.create({ ladder });
      }

      let productData = {
        title,
        asin,
        price,
        rating,
        product_details,
        url,
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
      if (!newPage) {
        await browser.close();
      }

      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: responseData,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
};
