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
        let categoryName;
        if (ladder.length > 2) {
          categoryName = ladder[2]["name"];
        }
        categoryName = categoryName.replaceAll("&", "and");
        let category = await CategoryModel.findOne({
          name: categoryName,
          ladder,
        });
        if (!category) {
          category = await CategoryModel.create({
            name: categoryName,
            ladder,
          });
        }
        let img_url = responseData.images.length ? responseData.images : [];
        responseData.product_details.brand = responseData.brand?.trim();
        if (!responseData.product_details?.brand && responseData.manufacturer) {
          let brand = responseData.manufacturer?.toLowerCase();
          brand = brand?.replaceAll("store", "");
          brand = brand?.replaceAll("brand", "");
          brand = brand?.replaceAll("mobile", "");
          brand = brand?.replaceAll("india", "");
          brand = brand?.trim();
          if (brand) {
            responseData.product_details.brand = brand;
          }
        }

        // if (responseData.product_details?.ram) {
        //   let ram =0
        //   ram= responseData.product_details.ram.replace(/[^0-9\.]+/g, "");
        //   let ram_unit=''
        //   ram_unit=responseData.product_details.ram.replace(/[0-9]/g, '').trim()
        //   responseData.product_details.ram=parseNumber(ram)
        //   responseData.product_details.ram_unit=ram_unit
        // }
        let productData = {
          title: responseData.product_name,
          productId: responseData.asin,
          price: parseFloat(responseData.price),
          currency: responseData.currency,
          rating: parseFloat(responseData.rating),
          store: "amazon",
          product_details: responseData.product_details,
          url: responseData.url,
          category_id: category._id,
          img_url,
        };
        let product;
        product = await ProductModel.findOne({
          productId: productData.productId,
        });
        if (!product) {
          product = await ProductModel.create(productData);
        } else {
          product = await ProductModel.updateOne(
            { productId: productData.productId },
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
      const productId = urlLink.split("pid=")[1]?.split("&")[0];

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

      let title = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > h1 > span"
      );
      if (!title) {
        title = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(1) > h1 > span"
        );
      }

      let rating = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > div > span:nth-child(1) > div"
      );

      if (!rating) {
        rating = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(4) > div:nth-child(1) > div > span:nth-child(1) > div"
        );
      }
      if (!rating) {
        rating = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div > span:nth-child(1) > div"
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
      if (!price) {
        price = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
        );
      }

      const category_1 = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-child(2) > a"
      );
      let category_2 = await getElementText(
        "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-child(3) > a"
      );
      if (category_2 == "Home Appliances") {
        category_2 = await getElementText(
          "#container > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-child(4) > a"
        );
      }

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
      let category = await CategoryModel.findOne({ name: category_2, ladder });
      if (!category) {
        category = await CategoryModel.create({ name: category_2, ladder });
      }

      let finalPrice = price.replace(/₹/g, "")?.replaceAll(",", "");
      if (product_details.brand) {
        product_details.brand = product_details.brand.trim();
      }
      if (product_details?.["internal storage"]) {
        let rom = 0;
        rom = product_details["internal storage"].replace(/[^0-9\.]+/g, "");
        let rom_unit = "";
        rom_unit = product_details["internal storage"]
          .replace(/[0-9]/g, "")
          .trim();
        if (rom) {
          product_details.rom = parseInt(rom);
        }
        if (rom_unit) {
          product_details.rom_unit = rom_unit;
        }
      }
      if (product_details.ram) {
        let ram = 0;
        ram = product_details.ram.replace(/[^0-9\.]+/g, "");
        let ram_unit = "";
        ram_unit = product_details.ram.replace(/[0-9]/g, "").trim();
        if (ram) {
          product_details.ram = parseInt(ram);
        }
        if (ram_unit) {
          product_details.ram_unit = ram_unit;
        }
      }
      if (product_details?.["battery capacity"]) {
        let battery_size;
        let battery_unit;
        battery_size = product_details["battery capacity"].replace(
          /[^0-9\.]+/g,
          ""
        );
        battery_unit = product_details["battery capacity"]
          .replace(/[0-9]/g, "")
          .trim();
        if (battery_size) {
          product_details.battery_size = parseInt(battery_size);
        }
        if (battery_unit) {
          product_details.battery_unit = battery_unit;
        }
      } else if (product_details?.["Battery Power Rating"]) {
        product_details.battery_size = parseInt(
          product_details?.["Battery Power Rating"]
        );
      }
      if (product_details?.["operating system"]) {
        let os_type;
        let os_version;
        if (
          product_details?.["operating system"]
            ?.toLowerCase()
            ?.includes("android")
        ) {
          os_type = "Android";
        } else if (
          product_details?.["operating system"]?.toLowerCase()?.includes("ios")
        ) {
          os_type = "iOS";
        } else if (
          product_details?.["operating system"]
            ?.toLowerCase()
            ?.includes("Windows")
        ) {
          os_type = "Windows";
        }
        let os_version_arr = product_details?.["operating system"]
          ?.split(os_type)
          ?.filter((item) => item.trim())
          ?.join("")
          ?.trim()
          ?.split(" ")
          ?.filter((item) => item.trim())
          ?.filter((item) => {
            if (item.replaceAll(/[^0-9\.]+/g, "")) {
              return true;
            } else {
              return false;
            }
          });
        if (os_version_arr?.length) {
          os_version = os_version_arr[0];
        }
        if (os_version?.toString()) {
          product_details.os_version = parseInt(os_version);
        }
        if (os_type) {
          product_details.os_type = os_type;
        }
      }
      if (product_details?.["network type"]) {
        let two_g;
        let three_g;
        let four_g;
        let five_g;
        let volte;
        if (product_details?.["network type"]?.toLowerCase()?.includes("2g")) {
          two_g = true;
        }
        if (product_details?.["network type"]?.toLowerCase()?.includes("3g")) {
          three_g = true;
        }
        if (product_details?.["network type"]?.toLowerCase()?.includes("4g")) {
          four_g = true;
        }
        if (product_details?.["network type"]?.toLowerCase()?.includes("5g")) {
          five_g = true;
        }
        if (
          product_details?.["network type"]?.toLowerCase()?.includes("volte")
        ) {
          volte = true;
        }
        if (two_g) {
          product_details["2G"] = two_g;
        }
        if (three_g) {
          product_details["3G"] = three_g;
        }
        if (four_g) {
          product_details["4G"] = four_g;
        }
        if (five_g) {
          product_details["5G"] = five_g;
        }
        if (volte) {
          product_details.volte = volte;
        }
      }
      let productData = {
        title,
        productId,
        price: parseFloat(finalPrice),
        rating: parseFloat(rating),
        product_details,
        url,
        store: "flipkart",
        category_id: category._id,
        img_url,
      };
      let product;
      product = await ProductModel.findOne({
        productId: productData.productId,
      });
      if (!product) {
        product = await ProductModel.create(productData);
      } else {
        product = await ProductModel.updateOne(
          { productId: productData.productId },
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
        data: productData,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
};
