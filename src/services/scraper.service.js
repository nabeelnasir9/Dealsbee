import puppeteer from "puppeteer";
import axios from "axios";
import { CategoryModel, ProductModel } from "../models/index.js";
import config from "../config/index.js";
import { ScraperHelper } from "../helpers/index.js";

export const ScraperService = {
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
  scrapeAmazonProductList: async () => {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto("https://www.amazon.com/", {
        waitUntil: "load",
        waitUntil: "domcontentloaded",
        visible: true,
        timeout: 10000,
      });
      await page.waitForTimeout(2000);
      let attempt = 0;
      async function gotoPage(page, attempt) {
        attempt = attempt + 1;
        await page.goto("https://www.amazon.com/", {
          waitUntil: "load",
          waitUntil: "domcontentloaded",
          visible: true,
        });
      }
      const captchImg = await page.waitForSelector("form img");
      if (captchImg) {
        if (attempt == 5) {
          browser.close();
        }
        gotoPage(page, attempt);
      }
      await Promise.all([page.waitForNavigation()]);
      let menuBtn;
      try {
        menuBtn = await page.waitForSelector("#nav-hamburger-menu", {
          visible: true,
        });
      } catch (error) {
        const logoBtn = await page.waitForSelector("nav-bb-logo", {
          visible: true,
        });
        logoBtn.click();
        menuBtn = await page.waitForSelector("#nav-hamburger-menu", {
          visible: true,
        });
      }
      if (menuBtn) {
        menuBtn.click();
        const menu = await page.waitForSelector("#hmenu-content", {
          visible: true,
        });

        let urls = {};
        if (menu) {
          async function getLinks(number) {
            let list = [];
            try {
              const element = await menu.waitForSelector(
                `ul:nth-child(${number})`
              );
              list = await element.$$eval("a", (elements) => {
                return elements.map((element, index) => {
                  if (index > 0) {
                    return { title: element.textContent, link: element.href };
                  }
                });
              });
              list = list.filter((item) => item);
            } catch (error) {
              console.log("error while scraping list", error);
            }
            return list;
          }
          const electonicList = await getLinks(5);
          urls.Electronics = electonicList;
          const computerList = await getLinks(6);
          urls.Computers = computerList;
          const delayBetweenPages = 2000;
          const keys = Object.keys(urls);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            try {
              for (let j = 0; j < urls[`${key}`].length; j++) {
                try {
                  await page.goto(urls[`${key}`][j]["link"], {
                    waitUntil: "domcontentloaded",
                  });
                  await page.waitForSelector(".a-link-normal", {
                    visible: true,
                  });
                  const hrefArray = await page.$$eval(
                    ".a-link-normal",
                    (elements) => {
                      return elements.map((element) =>
                        element.getAttribute("href")
                      );
                    }
                  );
                  const links = hrefArray.toString();
                  const matchLink = links.split("dp/");
                  let extractedStrings = matchLink.map((link) => {
                    const endIndex = link.indexOf("/");
                    return endIndex !== -1 ? link.substring(0, endIndex) : link;
                  });
                  let uniqueArr = Array.from(new Set(extractedStrings));
                  if (uniqueArr.length > 0) {
                    uniqueArr.filter((item) => {
                      return item ? true : false;
                    });
                  }
                  uniqueArr = uniqueArr.filter((item) => item);
                  for (let j = 0; j < uniqueArr.length > 0; j++) {
                    try {
                      const data = await ScraperHelper.scrapeAmazonProduct(
                        uniqueArr[j]
                      );
                    } catch (error) {
                      console.log(
                        "error in amazon product asin = " + uniqueArr[j]
                      );
                    }
                  }
                  urls[`${key}`][j]["id"] = uniqueArr;
                  await page.waitForTimeout(delayBetweenPages);
                } catch (error) {
                  console.log(
                    "Error in Sub-Catgory " + urls[`${key}`][j]["title"]
                  );
                }
              }
            } catch (error) {
              console.log("Error in " + key);
            }
          }
        }
        await browser.close();
        return {
          status: 200,
          message: "Successfully fetched href URLs",
          data: urls,
        };
      }
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
  searchAmazonProducts: async ({ query, category_id }) => {
    const oxylabsData =
      config.env.oxylabxUsername + ":" + config.env.oxylabsPassword;
    const category = await CategoryModel.findById(category_id);
    try {
      let buff = new Buffer(oxylabsData);
      let oxylabsConfig = buff.toString("base64");

      let data = JSON.stringify({
        source: "amazon_search",
        domain: "com",
        query,
        parse: true,
        context: [
          {
            key: "category_id",
            value: category.amazon_id,
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
          const products = [];
          if (
            response?.data?.results?.length &&
            response.data.results[0].content?.results?.organic?.length
          ) {
            let { organic } = response.data.results[0].content.results;
            for (let i = 0; i < organic.length; i++) {
              let responseData = await ProductModel.findOne({
                asin: organic[i].asin,
              });
              if (responseData) {
                responseData = await ProductModel.updateOne(
                  { _id: responseData._id },
                  {
                    title: organic[i].title,
                    asin: organic[i].asin,
                    price: organic[i].price,
                    currency: organic[i].currency,
                    rating: organic[i].rating,
                    url: organic[i].url,
                    img_url: organic[i].url_image,
                  }
                );
              }
              responseData = await ProductModel.create({
                title: organic[i].title,
                asin: organic[i].asin,
                price: organic[i].price,
                currency: organic[i].currency,
                rating: organic[i].rating,
                url: organic[i].url,
                img_url: organic[i].url_image,
              });
              if (responseData) {
                products.push(responseData);
              }
            }
          }
          return products;
        })
        .catch((error) => {
          throw {
            status: error?.status ? error.status : 400,
            message: error.message ? error.message : "Error in OXYLABS API",
          };
        });
      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: response,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
  scrapeFlipkartProduct: async (url) => {
    const oxylabsData =
      config.env.oxylabxUsername + ":" + config.env.oxylabsPassword;
    try {
      let buff = new Buffer(oxylabsData);
      let oxylabsConfig = buff.toString("base64");

      let data = JSON.stringify({
        source: "universal_ecommerce",
        parse: true,
        url: url,
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
