import puppeteer from "puppeteer";
import axios from "axios";
import { CategoryModel, ProductModel } from "../models/index.js";
import config from "../config/index.js";
import { ScraperHelper } from "../helpers/index.js";
import { KnownDevices } from "puppeteer";
const iPhone = KnownDevices["iPhone 6"];

export const ScraperService = {
  scrapeAmazonProduct: ScraperHelper.scrapeAmazonProduct,
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
    try {
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "domcontentloaded",
      });

      let data = [];

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
      await browser.close();

      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: data,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
  scrapeFlipkartProductList: async () => {
    try {
      const pageLink = "https://www.flipkart.com";
      const categoriesLink = {
        Electronics: {},
      };
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.emulate(iPhone);
      await page.goto(pageLink, {
        waitUntil: "networkidle0",
      });

      let data = "";
      const electronicsCategory = await page.waitForSelector(
        "#_parentCtr_>div>div>div>div>div>div>div>div>div>div>div>div:nth-child(5)",
        { visible: true }
      );
      await electronicsCategory.click();
      try {
        await page.waitForNavigation("networkidle2", { timeout: 30000 });
      } catch (err) {
        console.log(err);
      }
      const url = page.url();
      categoriesLink["Electronics"]["link"] = url;

      //sub-category
      const subCategory_1 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(6)>div>div>div>div>div:nth-child(1)",
        { visble: true }
      );
      await subCategory_1.click();
      await page.waitForNavigation("networkidle2");
      let url_1 = page.url();
      categoriesLink["Electronics"]["category"] = [{ link: url_1 }];
      await page.goBack();
      const subCategory_2 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(6)>div>div>div>div>div:nth-child(2)"
      );
      await subCategory_2.click();
      await page.waitForNavigation("networkidle2");
      let url_2 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_2 });
      await page.goBack();
      const subCategory_3 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(6)>div>div>div>div>div:nth-child(3)"
      );
      await subCategory_3.click();
      await page.waitForNavigation("networkidle2");
      let url_3 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_3 });
      await page.goBack();
      const subCategory_4 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(6)>div>div>div>div>div:nth-child(4)"
      );
      await subCategory_4.click();
      await page.waitForNavigation("networkidle2");
      let url_4 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_4 });
      await page.goBack();
      //sub-category

      //sub-category
      const subCategory_5 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(7)>div>div>div>div>div:nth-child(1)",
        { visble: true }
      );
      await subCategory_5.click();
      await page.waitForNavigation("networkidle2");
      let url_5 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_5 });
      await page.goBack();
      const subCategory_6 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(7)>div>div>div>div>div:nth-child(2)"
      );
      await subCategory_6.click();
      await page.waitForNavigation("networkidle2");
      let url_6 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_6 });
      await page.goBack();
      const subCategory_7 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(7)>div>div>div>div>div:nth-child(3)"
      );
      await subCategory_7.click();
      await page.waitForNavigation("networkidle2");
      let url_7 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_7 });
      await page.goBack();
      const subCategory_8 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(7)>div>div>div>div>div:nth-child(4)"
      );
      await subCategory_8.click();
      await page.waitForNavigation("networkidle2");
      let url_8 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_8 });
      await page.goBack();
      //sub-category

      //sub-category
      const subCategory_9 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(8)>div>div>div>div>div:nth-child(1)",
        { visble: true }
      );
      await subCategory_9.click();
      await page.waitForNavigation("networkidle2");
      let url_9 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_9 });
      await page.goBack();
      const subCategory_10 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(8)>div>div>div>div>div:nth-child(2)"
      );
      await subCategory_10.click();
      await page.waitForNavigation("networkidle2");
      let url_10 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_10 });
      await page.goBack();
      const subCategory_11 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(8)>div>div>div>div>div:nth-child(3)"
      );
      await subCategory_11.click();
      await page.waitForNavigation("networkidle2");
      let url_11 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_11 });
      await page.goBack();
      const subCategory_12 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(8)>div>div>div>div>div:nth-child(4)"
      );
      await subCategory_12.click();
      await page.waitForNavigation("networkidle2");
      let url_12 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_12 });
      await page.goBack();
      //sub-category

      //sub-category
      const subCategory_13 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(9)>div>div>div>div>div:nth-child(1)",
        { visble: true }
      );
      await subCategory_13.click();
      await page.waitForNavigation("networkidle2");
      let url_13 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_13 });
      await page.goBack();
      const subCategory_14 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(9)>div>div>div>div>div:nth-child(2)"
      );
      await subCategory_14.click();
      await page.waitForNavigation("networkidle2");
      let url_14 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_14 });
      await page.goBack();
      const subCategory_15 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(9)>div>div>div>div>div:nth-child(3)"
      );
      await subCategory_15.click();
      await page.waitForNavigation("networkidle2");
      let url_15 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_15 });
      await page.goBack();
      const subCategory_16 = await page.waitForSelector(
        "#_parentCtr_>div:nth-child(9)>div>div>div>div>div:nth-child(4)"
      );
      await subCategory_16.click();
      await page.waitForNavigation("networkidle2");
      let url_16 = page.url();
      categoriesLink["Electronics"]["category"].push({ link: url_16 });
      await page.goBack();
      //sub-category
      await browser.close();

      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: data,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
};
