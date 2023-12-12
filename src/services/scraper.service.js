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
      const categoriesLink = [];
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto(pageLink, {
        waitUntil: "networkidle0",
      });

      const modalClose = await page.waitForSelector(
        "body > div.fbDBuK._3CYmv5 > div > span",
        { visible: true }
      );
      if (modalClose) {
        modalClose.click();
        const categoryBtn = await page.waitForSelector(
          '[aria-label="Electronics"]',
          { visible: true }
        );
        if (categoryBtn) {
          categoryBtn.click();

          const electronicBtn = await page.waitForSelector(
            "#container > div > div._331-kn > div > div > span:nth-child(1)",
            { visible: true }
          );
          if (electronicBtn) {
            electronicBtn.hover();

            const mobilesLink = await page.waitForSelector('[title="Mobiles"]');
            const siblingElements = await page.evaluate((element) => {
              const siblings = [];
              let sibling = element.nextElementSibling;
              while (sibling) {
                if (sibling.tagName === "A" && sibling.href) {
                  siblings.push(sibling.href);
                }
                sibling = sibling.nextElementSibling;
              }
              return siblings;
            }, mobilesLink);
            categoriesLink.push(...siblingElements);

            const accessoriesLink = await page.waitForSelector(
              '[title="Mobile Accessories"]'
            );
            const siblingElements_2 = await page.evaluate((element) => {
              const siblings = [];
              let sibling = element.nextElementSibling;
              while (sibling) {
                if (sibling.tagName === "A" && sibling.href) {
                  siblings.push(sibling.href);
                }
                sibling = sibling.nextElementSibling;
              }
              return siblings;
            }, accessoriesLink);
            categoriesLink.push(...siblingElements_2);

            try {
              const LoptopsLink = await page.waitForSelector(
                '[title="Gaming Laptops"]'
              );
              const loptopsHref = await page.evaluate(
                (element) => element.href,
                LoptopsLink
              );
              categoriesLink.push(loptopsHref);
            } catch (error) {
              console.log("can't able to get laptop links");
            }
            try {
              const disktopLink = await page.waitForSelector(
                '[title="Desktop PCs"]'
              );
              const disktopHref = await page.evaluate(
                (element) => element.href,
                disktopLink
              );
              categoriesLink.push(disktopHref);
            } catch (error) {
              console.log("can't able to get disktop links");
            }

            try {
              const ipadsLink = await page.waitForSelector(
                '[title="Apple iPads"]'
              );
              const ipadsHref = await page.evaluate(
                (element) => element.href,
                ipadsLink
              );
              categoriesLink.push(ipadsHref);
            } catch (error) {
              console.log("can't able to get ipads links");
            }
          }
        }
      }

      const allData = [];
      for (const pageUrl of categoriesLink) {
        await page.goto(pageUrl, {
          waitUntil: "domcontentloaded",
          visible: true,
        });
        const hrefArray = await page.$$eval(
          "#container div div:nth-child(3) a",
          (elements) => {
            return elements?.map((element) => element.getAttribute("href"));
          }
        );
        const base_url = "https://www.flipkart.com";
        const fullUrls = hrefArray.map((uri) => base_url + uri);
        const filteredUrls = fullUrls.filter((url) => url.includes("pid="));
        allData.push(filteredUrls);
      }
      await browser.close();
      const combinedArray = [].concat(...allData);
      const prodLink = [...new Set(combinedArray)];
      let productStore;
      for (let i = 0; i < prodLink.length > 0; i++) {
        try {
          productStore = await ScraperHelper.scrapeFlipkartProduct(prodLink[i]);
        } catch (error) {
          console.log("flipkart link failed");
          continue;
        }
      }

      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: productStore,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
};
