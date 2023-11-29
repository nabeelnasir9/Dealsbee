import cheerio from "cheerio";
import axios from "axios";
import { CategoryModel, ProductModel, RecordModel } from "../models/index.js";
import config from "../config/index.js";
import mongoose from "mongoose";
import { ApifyClient } from "apify-client";
const MAX_LINKS = 2;
const MAX_TIME_LIMIT = 20000;

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
  scrapeAmazonProductList: async (productIdList) => {
    const resultData = [];
    const oxylabsData =
      config.env.oxylabxUsername + ":" + config.env.oxylabsPassword;
    try {
      let buff = new Buffer(oxylabsData);
      let oxylabsConfig = buff.toString("base64");
      for (let i = 0; i < productIdList.length; i++) {
        let data = JSON.stringify({
          source: "amazon_product",
          domain: "com",
          query: productIdList[i],
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
            return false;
          });
        if (
          response?.status == 200 &&
          response.data?.results?.length &&
          response.data.results[0]["content"]
        ) {
          const responseData = response.data.results[0]["content"];
          let categoryData = responseData?.category[0]?.ladder;
          let categoryId = [];
          for (let i = 0; i < categoryData.length; i++) {
            const amazon_id = categoryData[i]["url"].split("node=")[1];
            let categoryResponse = await CategoryModel.findOne({ amazon_id });
            if (categoryResponse) {
              (categoryResponse.url = categoryData[i]["url"]),
                (categoryResponse.title = categoryData[i]["name"]),
                await categoryResponse.save();
            } else {
              categoryResponse = await CategoryModel.create({
                title: categoryData[i].name,
                amazon_id,
                url: categoryData[i].url,
              });
            }
            categoryId.push(categoryResponse._id);
            // response.data.results[0]["content"]?.category[0]?.ladder[i]['_id']=categoryResponse._id
            // response.data.results[0]["content"]?.category[0]?.ladder[i]['amazon_id']=amazon_id
          }

          let productData = {
            title: responseData.product_name,
            asin: responseData.asin,
            price: responseData.price,
            currency: responseData.currency,
            rating: responseData.ratings,
            product_details: responseData.product_details,
            url: responseData.url,
            category_id: categoryId,
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
        if (response?.data) {
          resultData.push(response.data);
        }
      }

      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: resultData,
      };
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
      const client = new ApifyClient({
        token: "apify_api_EsbBYiltezUU11bjxwr8uxVTVQY0P61c0gKP",
      });

      const input = {
        start_urls: [
          {
            url: url,
          },
        ],
        max_items_count: 30,
        proxySettings: {
          useApifyProxy: true,
          apifyProxyGroups: [],
          apifyProxyCountry: "US",
        },
      };

      const run = await client
        .actor("natanielsantos/flipkart-scraper")
        .call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      items.forEach((item) => {
        return item;
      });

      return {
        status: 200,
        message: "Successfull",
        response: "Record Fetched Successfully",
        data: items,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : "INTERNAL SERVER ERROR",
      };
    }
  },
  scraper: async (body) => {
    const { url } = body;
    let isScrapingError = false;
    let isTimeOut = false;
    let brand = {};
    let finalUrl = url;
    if (!url.includes("http://") && !url.includes("https://")) {
      if (url[0] == "/") {
        finalUrl = "https:/" + url;
      } else {
        finalUrl = "https://" + url;
      }
    } else if (url.includes("http://")) {
      finalUrl = url.replace("http://", "https://");
    }
    let baseUrl = new URL(finalUrl).origin + "/";
    let logo = "";
    let company_name =
      baseUrl.split("https://")[1].split(".")[0] != "www"
        ? baseUrl.split("https://")[1].split(".")[0]
        : baseUrl.split("https://")[1].split(".")[1];
    let email = "";
    let phone_number = "";
    let text = [];
    let twitter = "";
    let facebook = "";
    let linkedin = "";
    let discord = "";
    let services = [];
    let products = [];
    let links = [];
    const configuration = {
      headers: {
        "Accept-Encoding": "*",
      },
      timeout: 10000,
    };
    const isValidUrl = (urlString) => {
      var urlPattern = new RegExp(
        "^(https?:\\/\\/)?" +
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
          "((\\d{1,3}\\.){3}\\d{1,3}))" +
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
          "(\\?[;&a-z\\d%_.~+=-]*)?" +
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );
      return !!urlPattern.test(urlString);
    };
    function urlCompleter(value, baseUrl) {
      if (
        value &&
        !value.includes("https://") &&
        !value.includes("http:") &&
        !value.includes(baseUrl)
      ) {
        value = baseUrl + value.replace(/^\//, "");
      }
      return value;
    }
    function getText(parent, currentPage) {
      let text = "";
      if (
        parent?.attribs?.class?.includes("nav") ||
        parent?.name?.includes("nav")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("cookie") &&
        parent?.data?.toLowerCase()?.includes("setting")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("cookie") &&
        parent?.data?.toLowerCase()?.includes("third part")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("cookie") &&
        parent?.data?.toLowerCase()?.includes("privacy")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("cookie") &&
        parent?.data?.toLowerCase()?.includes("personal")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("skip") &&
        parent?.data?.toLowerCase()?.includes("to main")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("cookie") &&
        parent?.data?.toLowerCase()?.includes("enable")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("accept") &&
        parent?.data?.toLowerCase()?.includes("yes")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("accept") &&
        parent?.data?.toLowerCase()?.includes("agree")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("security") &&
        parent?.data?.toLowerCase()?.includes("issue")
      ) {
        text = "";
      } else if (
        parent?.data?.toLowerCase()?.includes("cookie") &&
        parent?.data?.toLowerCase()?.includes("improve")
      ) {
        text = "";
      } else if (
        parent?.type &&
        parent?.type == "a" &&
        getText(parent, currentPage)?.length < 10
      ) {
        text = "";
      } else if (
        parent?.type?.includes("text") &&
        !parent.parent?.type?.includes("style") &&
        !parent.parent?.type?.includes("script") &&
        !parent.parent?.name?.includes("noscript")
      ) {
        text = parent.data?.trim();
      } else if (parent?.children && parent?.children?.length > 0) {
        for (let i = 0; i < parent.children.length; i++) {
          text = text + getText(parent.children[i], currentPage);
        }
      }
      text = text.replaceAll("\n", "").trim().replace(/\s+/g, " ");
      return text;
    }

    function getList(element, currentPage) {
      let list = [];
      for (let i = 0; i < element.length; i++) {
        list.push(getText(element[i], currentPage));
      }
      return list;
    }

    function getTwitter(currentPage) {
      let value = "";
      const allLinks = currentPage("a");
      for (let i = 0; i < allLinks.length; i++) {
        if (allLinks[i]?.attribs?.href?.toLowerCase().includes("twitter")) {
          value = allLinks[i].attribs.href;
        }
      }
      return value;
    }
    function getFacebook(currentPage) {
      let value = "";
      const allLinks = currentPage("a");
      for (let i = 0; i < allLinks.length; i++) {
        if (allLinks[i]?.attribs?.href?.toLowerCase().includes("facebook")) {
          value = allLinks[i].attribs.href;
        }
      }
      return value;
    }
    function getDiscord(currentPage) {
      let value = "";
      const allLinks = currentPage("a");
      for (let i = 0; i < allLinks.length; i++) {
        if (allLinks[i]?.attribs?.href?.toLowerCase().includes("discord")) {
          value = allLinks[i].attribs.href;
        }
      }
      return value;
    }
    function getLinkdin(currentPage) {
      let value = "";
      const allLinks = currentPage("a");
      for (let i = 0; i < allLinks.length; i++) {
        if (allLinks[i]?.attribs?.href?.toLowerCase().includes("linkedin")) {
          value = allLinks[i].attribs.href;
        }
      }
      return value;
    }
    function getEmail(currentPage) {
      let value = "";
      if (currentPage('[href^="mailto"]').attr("href")) {
        value = currentPage('[href^="mailto"]')
          .attr("href")
          .replace("mailto:", "");
      }
      return value;
    }
    function getPhoneNumber(currentPage) {
      let value = "";
      if (currentPage('[href^="tel"]').attr("href")) {
        value = currentPage('[href^="tel"]').text().replace("tel:", "");
      }
      return value;
    }
    function getPhoneNumberFromText(currentPage) {
      let value = "";
      let allHeadings = [
        ...currentPage("h1"),
        ...currentPage("h2"),
        ...currentPage("h3"),
        ...currentPage("h4"),
        ...currentPage("h5"),
        ...currentPage("h6"),
        ...currentPage("strong"),
        ...currentPage("span"),
      ];
      for (let i = 0; i < allHeadings.length; i++) {
        let headingsText = getText(allHeadings[i], currentPage).toLowerCase();
        if (
          headingsText.toLowerCase().includes("tel:") ||
          headingsText.toLowerCase().includes("telephone no:") ||
          headingsText.toLowerCase().includes("mobile no:") ||
          headingsText.toLowerCase().includes("call us:") ||
          headingsText.toLowerCase().includes("reach us:") ||
          headingsText.toLowerCase().includes("contact us:") ||
          headingsText.toLowerCase().includes("get in touch:") ||
          headingsText.toLowerCase().includes("our number:") ||
          headingsText.toLowerCase().includes("customer service:") ||
          headingsText.toLowerCase().includes("dial:") ||
          headingsText.toLowerCase().includes("support:") ||
          headingsText.toLowerCase().includes("hotline:") ||
          headingsText.toLowerCase().includes("helpline:") ||
          headingsText.toLowerCase().includes("reception:") ||
          headingsText.toLowerCase().includes("enquiries:") ||
          headingsText.toLowerCase().includes("help:") ||
          headingsText.toLowerCase().includes("assistance:")
        ) {
          value = headingsText;
        }
      }
      return value;
    }
    function getLogo(currentPage, baseUrl) {
      let value = "";
      if (currentPage('[class*="logo"]').length) {
        if (currentPage('[class*="logo"]').attr("src")) {
          value = currentPage('[class*="logo"]').attr("src");
        } else if (currentPage('[class*="logo"]').find("img").attr("src")) {
          value = currentPage('[class*="logo"]').find("img").attr("src");
          if (
            !isValidUrl(urlCompleter(value, baseUrl)) &&
            currentPage('[class*="logo"]').find("img").attr("data-src")
          ) {
            value = currentPage('[class*="logo"]').find("img").attr("data-src");
          }
        }
      } else if (currentPage("header img").attr("src")) {
        value = currentPage("header img").attr("src");
      } else if (currentPage('[alt="Logo"]').length) {
        value = currentPage('[alt="Logo"]').attr("src");
      } else if (currentPage('[alt="logo"]').length) {
        value = currentPage('[alt="logo"]').attr("src");
      } else if (currentPage('[alt*="logo"]').length) {
        value = currentPage('[alt*="logo"]').attr("src");
      } else if (currentPage('[rel="icon"]').attr("href")) {
        value = currentPage('[rel="icon"]').attr("href");
      } else if (
        currentPage('img[src$=".png"], img[src$=".jpg"], img[src$=".jpeg"]')
          .length
      ) {
        value = currentPage(
          'img[src$=".png"], img[src$=".jpg"], img[src$=".jpeg"]'
        ).attr("src");
      }

      if (
        value &&
        !value.includes("https://") &&
        !value.includes("http:") &&
        !value.includes(baseUrl)
      ) {
        value = baseUrl + value.replace(/^\//, "");
      }
      return isValidUrl(value) ? value : "";
    }
    function getServices(currentPage) {
      let value = [];
      if (currentPage('[class*="feature"]').length) {
        value = getList(currentPage('[class*="feature"]'), currentPage);
      } else if (currentPage('[class*="service"]').length) {
        value = getList(currentPage('[class*="service"]'), currentPage);
      } else if (currentPage('[id*="feature"]').length) {
        value = getList(currentPage('[id*="feature"]'), currentPage);
      } else if (currentPage('[id*="service"]').length) {
        value = getList(currentPage('[id*="service"]'), currentPage);
      } else if (currentPage('[class*="offer"]').length) {
        value = getList(currentPage('[class*="offer"]'), currentPage);
      } else if (currentPage('[id*="offer"]').length) {
        value = getList(currentPage('[id*="offer"]'), currentPage);
      } else if (currentPage('[class*="plan"]').length) {
        value = getList(currentPage('[class*="plan"]'), currentPage);
      } else if (currentPage('[id*="plan"]').length) {
        value = getList(currentPage('[id*="plan"]'), currentPage);
      } else if (currentPage('[class*="subscription"]').length) {
        value = getList(currentPage('[class*="subscription"]'), currentPage);
      } else if (currentPage('[id*="subscription"]').length) {
        value = getList(currentPage('[id*="subscription"]'), currentPage);
      } else if (currentPage('[class*="pricing"]').length) {
        value = getList(currentPage('[class*="pricing"]'), currentPage);
      } else if (currentPage('[id*="pricing"]').length) {
        value = getList(currentPage('[id*="pricing"]'), currentPage);
      }
      let allHeadings = [
        ...currentPage("h1"),
        ...currentPage("h2"),
        ...currentPage("h3"),
        ...currentPage("h4"),
        ...currentPage("h5"),
        ...currentPage("h6"),
        ...currentPage("strong"),
      ];
      for (let i = 0; i < allHeadings.length; i++) {
        let headingsText = getText(allHeadings[i], currentPage).toLowerCase();
        if (
          headingsText.toLowerCase().includes("we offer") ||
          headingsText.toLowerCase().includes("we provide") ||
          headingsText.toLowerCase().includes("our offering") ||
          headingsText.toLowerCase().includes("our expertise") ||
          headingsText.toLowerCase().includes("our capabilit") ||
          headingsText.toLowerCase().includes("our portfolio") ||
          headingsText.toLowerCase().includes("industries we serve") ||
          headingsText.toLowerCase().includes("our work") ||
          headingsText.toLowerCase().includes("our clients") ||
          headingsText.toLowerCase().includes("our approach") ||
          headingsText.toLowerCase().includes("our methods") ||
          headingsText.toLowerCase().includes("our solutions") ||
          headingsText.toLowerCase().includes("our projects") ||
          headingsText.toLowerCase().includes("practice areas") ||
          headingsText.toLowerCase().includes("market segments") ||
          headingsText.toLowerCase().includes("industries served") ||
          headingsText.toLowerCase().includes("service catalogue") ||
          headingsText.toLowerCase().includes("service lines") ||
          headingsText.toLowerCase().includes("service areas") ||
          headingsText.toLowerCase().includes("client services") ||
          headingsText.toLowerCase().includes("training & development") ||
          headingsText.toLowerCase().includes("training and development") ||
          headingsText.toLowerCase().includes("technical services") ||
          headingsText.toLowerCase().includes("creative services") ||
          headingsText.toLowerCase().includes("marketing services") ||
          headingsText.toLowerCase().includes("it services") ||
          headingsText.toLowerCase().includes("business services") ||
          headingsText.toLowerCase().includes("support services") ||
          headingsText.toLowerCase().includes("managed services") ||
          headingsText.toLowerCase().includes("design services") ||
          headingsText.toLowerCase().includes("consulting services") ||
          headingsText.toLowerCase().includes("professional services") ||
          headingsText.toLowerCase().includes("services provided") ||
          headingsText.toLowerCase().includes("our specialties") ||
          headingsText.toLowerCase().includes("products and services") ||
          headingsText.toLowerCase().includes("service offering") ||
          headingsText.toLowerCase().includes("comprehensive service") ||
          headingsText.toLowerCase().includes("specialized service") ||
          headingsText.toLowerCase().includes("strategic service") ||
          headingsText.toLowerCase().includes("advanced capabilitie") ||
          headingsText.toLowerCase().includes("industry expertise") ||
          headingsText.toLowerCase().includes("client-focused service") ||
          headingsText.toLowerCase().includes("innovative solution") ||
          headingsText.toLowerCase().includes("tailored service") ||
          headingsText.toLowerCase().includes("professional offerings") ||
          headingsText.toLowerCase().includes("integrated services") ||
          headingsText.toLowerCase().includes("technical expertise") ||
          headingsText.toLowerCase().includes("extensive portfolio") ||
          headingsText.toLowerCase().includes("diverse service catalog") ||
          headingsText.toLowerCase().includes("wide range of services") ||
          headingsText.toLowerCase().includes("full-service options") ||
          headingsText.toLowerCase().includes("client support services") ||
          headingsText.toLowerCase().includes("solution-driven approach") ||
          headingsText.toLowerCase().includes("end-to-end services") ||
          headingsText.toLowerCase().includes("result-oriented solutions") ||
          headingsText.toLowerCase().includes("client satisfaction") ||
          headingsText.toLowerCase().includes("agile methodologies") ||
          headingsText.toLowerCase().includes("client partnerships") ||
          headingsText.toLowerCase().includes("quality assurance services") ||
          headingsText.toLowerCase().includes("project management services") ||
          headingsText.toLowerCase().includes("consultative approach") ||
          headingsText.toLowerCase().includes("value-added services") ||
          headingsText.toLowerCase().includes("cutting-edge solutions") ||
          headingsText.toLowerCase().includes("data-driven insights") ||
          headingsText.toLowerCase().includes("continuous improvement") ||
          headingsText.toLowerCase().includes("research and development")
        ) {
          value = getListFromParent(currentPage, allHeadings[i]);
        }
      }

      return value;
    }
    function getProducts(currentPage) {
      let value = [];
      if (currentPage('[class*="product"]').length) {
        value = getList(currentPage('[class*="product"]'), currentPage);
      }
      if (currentPage('[id*="product"]').length) {
        value = getList(currentPage('[id*="product"]'), currentPage);
      }
      if (currentPage('[class*="showcase"]').length) {
        value = getList(currentPage('[class*="showcase"]'), currentPage);
      }
      if (currentPage('[id*="showcase"]').length) {
        value = getList(currentPage('[id*="showcase"]'), currentPage);
      }
      if (currentPage('[class*="teaser"]').length) {
        value = getList(currentPage('[class*="teaser"]'), currentPage);
      }
      if (currentPage('[id*="teaser"]').length) {
        value = getList(currentPage('[id*="teaser"]'), currentPage);
      }
      let allHeadings = [
        ...currentPage("h1"),
        ...currentPage("h2"),
        ...currentPage("h3"),
        ...currentPage("h4"),
        ...currentPage("h5"),
        ...currentPage("h6"),
        ...currentPage("strong"),
      ];
      for (let i = 0; i < allHeadings.length; i++) {
        let headingsText = getText(allHeadings[i], currentPage).toLowerCase();
        if (
          headingsText == "products" ||
          headingsText.toLowerCase().includes("our products") ||
          headingsText.toLowerCase().includes("our catalog") ||
          headingsText.toLowerCase().includes("shop") ||
          headingsText.toLowerCase().includes("shop here") ||
          headingsText == "store" ||
          headingsText.toLowerCase().includes("our collection") ||
          headingsText.toLowerCase().includes("our inventory") ||
          headingsText.toLowerCase().includes("our selection") ||
          headingsText.toLowerCase().includes("our merchandise") ||
          headingsText.toLowerCase().includes("our goods") ||
          headingsText.toLowerCase().includes("our catalogue") ||
          headingsText.toLowerCase().includes("product list") ||
          headingsText.toLowerCase().includes("product lines") ||
          headingsText.toLowerCase().includes("featured products") ||
          headingsText.toLowerCase().includes("best sellers") ||
          headingsText.toLowerCase().includes("new arrivals") ||
          headingsText == "deals" ||
          headingsText == "specials" ||
          headingsText == "sale" ||
          headingsText == "discounts" ||
          headingsText == "accessories" ||
          headingsText.toLowerCase().includes("add ons") ||
          headingsText.toLowerCase().includes("customizable products") ||
          headingsText.toLowerCase().includes("made to order products") ||
          headingsText.toLowerCase().includes("personalized products") ||
          headingsText.toLowerCase().includes("private Label products") ||
          headingsText.toLowerCase().includes("generic products") ||
          headingsText == "kits" ||
          headingsText.toLowerCase().includes("packages") ||
          headingsText.toLowerCase().includes("product details") ||
          headingsText.toLowerCase().includes("product offerings") ||
          headingsText.toLowerCase().includes("product catalog") ||
          headingsText.toLowerCase().includes("product inventory") ||
          headingsText.toLowerCase().includes("product selection") ||
          headingsText.toLowerCase().includes("product range") ||
          headingsText.toLowerCase().includes("featured  items") ||
          headingsText.toLowerCase().includes("bestselling products") ||
          headingsText.toLowerCase().includes("new arrivals") ||
          headingsText.toLowerCase().includes("deals and discounts") ||
          headingsText.toLowerCase().includes("special offers") ||
          headingsText.toLowerCase().includes("limited-time promotions") ||
          headingsText.toLowerCase().includes("customizable options") ||
          headingsText.toLowerCase().includes("made-to-order products") ||
          headingsText.toLowerCase().includes("personalized items") ||
          headingsText.toLowerCase().includes("private label products") ||
          headingsText.toLowerCase().includes("generic products") ||
          headingsText.toLowerCase().includes("product kits") ||
          headingsText.toLowerCase().includes("package deals") ||
          headingsText.toLowerCase().includes("product specifications") ||
          headingsText.toLowerCase().includes("product variations") ||
          headingsText.toLowerCase().includes("product reviews") ||
          headingsText.toLowerCase().includes("product comparisons") ||
          headingsText.toLowerCase().includes("product recommendations") ||
          headingsText.toLowerCase().includes("product availability") ||
          headingsText.toLowerCase().includes("product pricing") ||
          headingsText.toLowerCase().includes("product specifications") ||
          headingsText.toLowerCase().includes("product warranties") ||
          headingsText.toLowerCase().includes("product dimensions") ||
          headingsText.toLowerCase().includes("product materials") ||
          headingsText.toLowerCase().includes("product sourcing") ||
          headingsText.toLowerCase().includes("product certifications") ||
          headingsText.toLowerCase().includes("product guarantees") ||
          headingsText.toLowerCase().includes("product shipping options") ||
          headingsText.toLowerCase().includes("product returns policy") ||
          headingsText
            .toLowerCase()
            .includes("product support and documentation") ||
          headingsText.toLowerCase().includes("product accessories") ||
          headingsText.toLowerCase().includes("product add-ons") ||
          headingsText
            .toLowerCase()
            .includes("product customization options") ||
          headingsText.toLowerCase().includes("merchandise") ||
          headingsText.toLowerCase().includes("rentals") ||
          headingsText.includes("Resources")
        ) {
          value = getListFromParent(currentPage, allHeadings[i].parent);
        }
      }
      return value;
    }
    function getCompanyText(currentPage) {
      let value = [];
      if (currentPage('[class*="about"]').length) {
        value = getList(currentPage('[class*="about"]'), currentPage);
      } else if (currentPage('[id*="about"]').length) {
        value = getList(currentPage('[id*="about"]'), currentPage);
      } else if (currentPage('[class*="values"]').length) {
        value = getList(currentPage('[class*="values"]'), currentPage);
      } else if (currentPage('[id*="values"]').length) {
        value = getList(currentPage('[id*="values"]'), currentPage);
      } else if (currentPage('[class*="ethic"]').length) {
        value = getList(currentPage('[class*="ethic"]'), currentPage);
      } else if (currentPage('[id*="ethic"]').length) {
        value = getList(currentPage('[id*="ethic"]'), currentPage);
      } else if (currentPage('[class*="believe"]').length) {
        value = getList(currentPage('[class*="believe"]'), currentPage);
      } else if (currentPage('[id*="believe"]').length) {
        value = getList(currentPage('[id*="believe"]'), currentPage);
      } else if (currentPage('[class*="principles"]').length) {
        value = getList(currentPage('[class*="principles"]'), currentPage);
      } else if (currentPage('[id*="principles"]').length) {
        value = getList(currentPage('[id*="principles"]'), currentPage);
      } else if (currentPage('[class*="motto"]').length) {
        value = getList(currentPage('[class*="motto"]'), currentPage);
      } else if (currentPage('[id*="motto"]').length) {
        value = getList(currentPage('[id*="motto"]'), currentPage);
      }

      let allHeadings = [
        ...currentPage("h1"),
        ...currentPage("h2"),
        ...currentPage("h3"),
        ...currentPage("h4"),
        ...currentPage("h5"),
        ...currentPage("h6"),
        ...currentPage("strong"),
      ];
      for (let i = 0; i < allHeadings.length; i++) {
        let headingsText = getText(allHeadings[i], currentPage).toLowerCase();
        if (
          headingsText.toLowerCase().includes("our values") ||
          headingsText.toLowerCase().includes("what we believe") ||
          headingsText.toLowerCase().includes("our core values") ||
          headingsText.toLowerCase().includes("code of ethics") ||
          headingsText.toLowerCase().includes("principles we follow") ||
          headingsText.toLowerCase().includes("key principles") ||
          headingsText.toLowerCase().includes("company principles") ||
          headingsText.toLowerCase().includes("about company") ||
          headingsText.toLowerCase().includes("our philosophy") ||
          headingsText.toLowerCase().includes("core principles") ||
          headingsText.toLowerCase().includes("ethical standards") ||
          headingsText.toLowerCase().includes("social values") ||
          headingsText.toLowerCase().includes("corporate structure") ||
          headingsText.toLowerCase().includes("integrity") ||
          headingsText.toLowerCase().includes("who we are") ||
          headingsText.toLowerCase().includes("our motto")
        ) {
          value = getListFromParent(currentPage, allHeadings[i].parent);
        }
      }
      if (currentPage("meta[property='og:title']").attr("content")) {
        value.push(currentPage("meta[property='og:title']").attr("content"));
      } else if (currentPage("title").text()) {
        value.push(currentPage("title").text());
      }
      if (currentPage("meta[property='og:description']").attr("content")) {
        value.push(
          currentPage("meta[property='og:description']").attr("content")
        );
      } else if (
        currentPage("meta[property='og:description']").attr("content")
      ) {
        value.push(currentPage("description").text());
      }

      if (value.length == 0) {
        return getList(currentPage("body"));
      }
      return value;
    }
    function getListFromParent(currentPage, element) {
      let value = [];
      if (currentPage(element).siblings().length) {
        value = getList(element.parent.children, currentPage);
      } else {
        value = getListFromParent(currentPage, element.parent);
      }
      return value;
    }
    function removeDuplicates(list) {
      let result = [];
      result = list.filter((item, index, self) => {
        return self.indexOf(item) == index && item ? true : false;
      });
      return result;
    }
    async function getPage(url, config) {
      const response = await axios
        .get(url, { ...config })
        .then(async (res) => {
          return res;
        })
        .catch(async (error) => {
          throw {
            status: 400,
            response: "Could not scrape the URL",
          };
        });
      return response;
    }
    try {
      const res = await getPage(finalUrl, configuration);
      const $ = cheerio.load(res.data);
      if (finalUrl) {
        logo = getLogo($, baseUrl);
        if (!email) {
          email = getEmail($);
        }
        if (!phone_number) {
          phone_number = getPhoneNumber($);
          if ((phone_number = "")) {
            phone_number = getPhoneNumberFromText($);
          }
        }
        if ($("title").text()) {
          text.push($("title").text());
        }
        text = getCompanyText($);
        services.push(...getServices($));
        products.push(...getProducts($));
        twitter = getTwitter($);
        facebook = getFacebook($);
        discord = getDiscord($);
        linkedin = getLinkdin($);
        function getLinksForScraping(MAX_LINKS) {
          let value = [];
          let links = [];
          if ($("a").length) {
            links.push(...$("a"));
          }
          for (let i = 0; i < links.length; i++) {
            if (!links[i]?.attribs?.href) {
              links.splice(i, 1);
              continue;
            }
            for (let j = 0; j < links.length; j++) {
              if (
                links[i]?.attribs?.href === links[j]?.attribs?.href &&
                i !== j
              ) {
                links.splice(j, 1);
              }
            }
            if (
              !isValidUrl(links[i]?.attribs?.href) ||
              links[i]?.attribs?.href?.includes("youtube") ||
              links[i]?.attribs?.href?.includes("facebook") ||
              links[i]?.attribs?.href?.includes("twitter") ||
              links[i]?.attribs?.href?.includes("instagram")
            ) {
              links.splice(i, 1);
            }
          }
          for (let i = 0; i < links.length; i++) {
            if (
              links[i]?.attribs?.href &&
              (value.length < MAX_LINKS ||
                links[i]?.attribs?.href.toLowerCase().includes("product") ||
                links[i]?.attribs?.href.toLowerCase().includes("service") ||
                links[i]?.attribs?.href.toLowerCase().includes("industry") ||
                links[i]?.attribs?.href.toLowerCase().includes("catalog") ||
                links[i]?.attribs?.href.toLowerCase().includes("expertise") ||
                links[i]?.attribs?.href.toLowerCase().includes("solutions") ||
                links[i]?.attribs?.href.toLowerCase().includes("merchandise") ||
                links[i]?.attribs?.href.toLowerCase().includes("accessories") ||
                links[i]?.attribs?.href.toLowerCase().includes("shipping") ||
                links[i]?.attribs?.href.toLowerCase().includes("pricing") ||
                links[i]?.attribs?.href.toLowerCase().includes("recomend") ||
                links[i]?.attribs?.href
                  .toLowerCase()
                  .includes("specification") ||
                links[i]?.attribs?.href.toLowerCase().includes("deals") ||
                links[i]?.attribs?.href.toLowerCase().includes("kits") ||
                links[i]?.attribs?.href
                  .toLowerCase()
                  .includes("new arrivals") ||
                links[i]?.attribs?.href
                  .toLowerCase()
                  .includes("specification") ||
                links[i]?.attribs?.href.toLowerCase().includes("packages") ||
                links[i]?.attribs?.href.toLowerCase().includes("best seller") ||
                links[i]?.attribs?.href
                  .toLowerCase()
                  .includes("featured products") ||
                links[i]?.attribs?.href.toLowerCase().includes("inventory") ||
                links[i]?.attribs?.href.toLowerCase().includes("collection"))
            ) {
              value.push(links[i]?.attribs?.href);
            }
          }
          return value;
        }
        links = getLinksForScraping(MAX_LINKS);
        if (links.length) {
          setTimeout(() => {
            isTimeOut = true;
          }, MAX_TIME_LIMIT);
          for (let i = 0; i < links.length && !isTimeOut; i++) {
            try {
              await axios
                .get(
                  `${
                    links[i].includes("https")
                      ? links[i]
                      : baseUrl + links[i].replace(/^\//, "")
                  }`,
                  { timeout: 10000 }
                )
                .then(async (newResponse) => {
                  const newPage = cheerio.load(newResponse.data);
                  if (!email) {
                    email = getEmail(newPage);
                  }
                  if (!phone_number) {
                    phone_number = getPhoneNumber(newPage);
                  }
                  if (!twitter) {
                    twitter = getTwitter(newPage);
                  }
                  if (!facebook) {
                    facebook = getFacebook(newPage);
                  }
                  if (!discord) {
                    discord = getDiscord(newPage);
                  }
                  if (!linkedin) {
                    linkedin = getLinkdin(newPage);
                  }
                  const newPageName = newPage("title").text();
                  services.push(...getServices(newPage));
                  if (
                    newPageName.toLowerCase().includes("service") &&
                    services.length < 1
                  ) {
                    if (newPage("ul li").length) {
                      const serviceList = newPage("ul li");
                      for (let i = 0; i < serviceList.length; i++) {
                        services.push(getText(serviceList[i], newPage));
                      }
                    }
                    if (newPage("ol li").length) {
                      const serviceList = newPage("ul li");
                      for (let i = 0; i < serviceList.length; i++) {
                        services.push(getText(serviceList[i], newPage));
                      }
                    }
                  }
                  products.push(...getProducts(newPage));
                  if (
                    newPageName.toLowerCase().includes("product") &&
                    products.length < 1
                  ) {
                    if (newPage("ul li").length) {
                      const productList = newPage("ul li");
                      for (let i = 0; i < productList.length; i++) {
                        products.push(getText(productList[i], newPage));
                      }
                    } else if (newPage("ol li").length) {
                      const productList = newPage("ul li");
                      for (let i = 0; i < productList.length; i++) {
                        products.push(getText(productList[i], newPage));
                      }
                    }
                  }
                  if (text.length < 1) {
                    text = getCompanyText(newPage);
                  }
                  if (
                    newPageName.toLowerCase().includes("about") &&
                    text.length < 1
                  ) {
                    if (newPage("p").length) {
                      const textList = newPage("p");
                      for (let i = 0; i < textList.length; i++) {
                        text.push(getText(textList[i], newPage));
                      }
                    }
                  }
                })
                .catch(() => {
                  throw {
                    status: 400,
                    response: "Could not scrape the URL",
                  };
                });
            } catch (error) {
              continue;
            }
          }
        }
        services = removeDuplicates(services);
        products = removeDuplicates(products);
        text = removeDuplicates(text);
      }
    } catch (error) {
      console.log("error in scraping");
      isScrapingError = true;
    }
    brand = {
      company_name,
      logo,
      email,
      text,
      phone_number,
      services,
      products,
      social_media: {
        twitter,
        facebook,
        discord,
        linkedin,
      },
    };
    try {
      let brandData = await RecordModel.find({
        company_name: brand.company_name,
      });
      if (brandData.length > 0) {
        brandData = await RecordModel.findOneAndUpdate(
          {
            company_name: brand.company_name,
          },
          {
            ...brand,
          },
          { new: true }
        );
      } else {
        brandData = await RecordModel.create(brand);
      }
      return {
        status: isScrapingError ? 204 : 200,
        message: isScrapingError ? "No Content" : "Successfull",
        response:
          company_name.toUpperCase() +
          (isScrapingError ? " requires review" : " URL Scraped Successfully"),
        data: brandData,
      };
    } catch {
      throw {
        status: 500,
        message: "Internal Server Error",
        response: "Internal Server Error",
      };
    }
  },
  getProducts: async (query) => {
    let pipeline = [];
    if (query) {
      if (query.category_id) {
        pipeline.push({
          $match: {
            category_id: mongoose.Types.ObjectId(query.category_id),
          },
        });
      }
      if (query.brand) {
        pipeline[0]["$match"]["product_details.brand"] = {
          $regex: new RegExp(query.brand, "i"),
        };
      }
      if (query.price?.lt) {
        pipeline[0]["$match"]["$expr"] = {
          $lt: [{ $toDouble: "$price" }, +query.price.lt],
        };
      }
    }
    try {
      const data = await ProductModel.aggregate(pipeline);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Record Fetched Successfully",
          data,
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
  getRecord: async (id) => {
    try {
      const data = await RecordModel.findById(id);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Record Fetched Successfully",
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
  patchRecord: async (id, body) => {
    try {
      const data = await RecordModel.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Record Updated Successfully",
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
  deleteRecord: async (id) => {
    try {
      const data = await RecordModel.findByIdAndDelete(id);
      if (data) {
        return {
          status: 200,
          message: "Successfull",
          response: "Record Deleted Successfully",
          data: { _id: data._id },
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
};
