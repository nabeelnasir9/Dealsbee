import puppeteer from 'puppeteer';
import axios from 'axios';
import { CategoryModel, ProductModel } from '../models/index.js';
import config from '../config/index.js';
import { ScraperHelper } from '../helpers/index.js';
import { KnownDevices } from 'puppeteer';
const iPhone = KnownDevices['iPhone 6'];

export const ScraperService = {
  scrapeAmazonProduct: ScraperHelper.scrapeAmazonProduct,
  scrapeAmazonProductList: async () => {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto('https://www.amazon.com/', {
        waitUntil: 'load',
        waitUntil: 'domcontentloaded',
        visible: true,
        timeout: 10000,
      });
      await delay(2000);
      let attempt = 0;
      async function gotoPage(page, attempt) {
        attempt = attempt + 1;
        await page.goto('https://www.amazon.com/', {
          waitUntil: 'load',
          waitUntil: 'domcontentloaded',
          visible: true,
        });
      }
      let captchImg = '';
      try {
        captchImg = await page.waitForSelector('form img', { timeout: 10000 });
      } catch (err) {
        console.log('err in captcha');
      }
      if (captchImg) {
        if (attempt == 5) {
          browser.close();
        }
        gotoPage(page, attempt);
      }
      let menuBtn;
      try {
        menuBtn = await page.waitForSelector('#nav-hamburger-menu', {
          visible: true,
        });
      } catch (error) {
        const logoBtn = await page.waitForSelector('nav-bb-logo', {
          visible: true,
        });
        logoBtn.click();
        menuBtn = await page.waitForSelector('#nav-hamburger-menu', {
          visible: true,
        });
      }
      if (menuBtn) {
        menuBtn.click();
        const menu = await page.waitForSelector('#hmenu-content', {
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
              list = await element.$$eval('a', (elements) => {
                return elements.map((element, index) => {
                  if (index > 0) {
                    return { title: element.textContent, link: element.href };
                  }
                });
              });
              list = list.filter((item) => item);
            } catch (error) {
              console.log('error while scraping list', error);
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
                  await page.goto(urls[`${key}`][j]['link'], {
                    waitUntil: 'domcontentloaded',
                  });
                  try {
                    await page.waitForSelector('.a-link-normal', {
                      visible: true,
                      timeout: 10000,
                    });
                  } catch (error) {
                    await page.goto(urls[`${key}`][j]['link'], {
                      waitUntil: 'domcontentloaded',
                    });
                  }
                  const hrefArray = await page.$$eval(
                    '.a-link-normal',
                    (elements) => {
                      return elements.map((element) =>
                        element.getAttribute('href')
                      );
                    }
                  );
                  const links = hrefArray.toString();
                  const matchLink = links.split('dp/');
                  let extractedStrings = matchLink.map((link) => {
                    const endIndex = link.indexOf('/');
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
                        'error in amazon product asin = ' + uniqueArr[j]
                      );
                    }
                  }
                  urls[`${key}`][j]['id'] = uniqueArr;
                  await page.waitForTimeout(delayBetweenPages);
                } catch (error) {
                  console.log(
                    'Error in Sub-Catgory ' + urls[`${key}`][j]['title']
                  );
                }
              }
            } catch (error) {
              console.log('Error in ' + key);
            }
          }
        }
        await browser.close();
        return {
          status: 200,
          message: 'Successfully fetched href URLs',
          data: urls,
        };
      }
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : 'INTERNAL SERVER ERROR',
      };
    }
  },
  scrapeAmazonProductListIndia: async () => {
    let browser
    try {
      async function delay(time) {
        return new Promise(function (resolve) {
          setTimeout(resolve, time);
        });
      }
      browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--window-size=866,1500'],
      });

      const page = await browser.newPage();
      // await page.setViewport({ width: 866, height: 1500 });
      await page.goto('https://www.amazon.in/', {
        waitUntil: 'load',
        waitUntil: 'domcontentloaded',
        visible: true,
        timeout: 10000,
      });
      await delay(2000)
      // let attempt = 0;
      // async function gotoPage(page, attempt) {
      //   attempt = attempt + 1;
      //   await page.goto('https://www.amazon.in/', {
      //     waitUntil: 'load',
      //     waitUntil: 'domcontentloaded',
      //     visible: true,
      //   });
      // }
      // gotoPage(page, attempt);
      // await Promise.all([page.waitForNavigation()]);
      // const getMenuBtn = async () => {
      //   let menuBtn;
      //   try {
      //     menuBtn = await page.waitForSelector('#nav-hamburger-menu', {
      //       visible: true,
      //     });
      //   } catch (error) {
      //     const logoBtn = await page.waitForSelector('#nav-logo-sprites', {
      //       visible: true,
      //     });
      //     await logoBtn.click();
      //     menuBtn = await page.waitForSelector('#nav-hamburger-menu', {
      //       visible: true,
      //     });
      //   }
      //   return menuBtn;
      // };
      // const getMenu = async () => {
      //   let menu = await page.waitForSelector('#hmenu-content', {
      //     visible: true,
      //   });
      //   return menu;
      // };
      // const getMobileBtn = async () => {
      //   let value = '';
      //   let categoryBtn = await page.waitForSelector(
      //     '#hmenu-content > ul:nth-child(1) > li:nth-child(16)',
      //     {
      //       visible: true,
      //       waitUntil: 'load',
      //       waitUntil: 'domcontentloaded',
      //     }
      //   );
      //   value = await categoryBtn.evaluate((el) => el.textContent);
      //   await delay(500);
      //   if (!value?.toLocaleLowerCase()?.includes('mobiles')) {
      //     categoryBtn = await page.waitForSelector(
      //       '#hmenu-content > ul:nth-child(1) > li:nth-child(15)',
      //       {
      //         visible: true,
      //         waitUntil: 'load',
      //         waitUntil: 'domcontentloaded',
      //       }
      //     );
      //     value = await categoryBtn.evaluate((el) => el.textContent);
      //   }
      //   return categoryBtn;
      // };
      // const getElectronicsBtn = async () => {
      //   let value = '';
      //   let categoryBtn = await page.waitForSelector(
      //     '#hmenu-content > ul:nth-child(1) > li:nth-child(17)',
      //     {
      //       visible: true,
      //       waitUntil: 'load',
      //       waitUntil: 'domcontentloaded',
      //     }
      //   );
      //   value = await categoryBtn.evaluate((el) => el.textContent);
      //   await delay(500);
      //   if (!value?.toLocaleLowerCase()?.includes('electronic')) {
      //     categoryBtn = await page.waitForSelector(
      //       '#hmenu-content > ul:nth-child(1) > li:nth-child(16)',
      //       {
      //         visible: true,
      //         waitUntil: 'load',
      //         waitUntil: 'domcontentloaded',
      //       }
      //     );
      //     value = await categoryBtn.evaluate((el) => el.textContent);
      //   }
      //   return categoryBtn;
      // };

      // let menuBtn;
      // let categoryBtn;
      // let urls = {};
      // menuBtn = await getMenuBtn();
      // await menuBtn.click();
      // if (menuBtn) {
      //   let menu = await getMenu();
      //   categoryBtn = await getMobileBtn();
      //   await categoryBtn.click();
      //   let els = await page.$$('#hmenu-content > ul:nth-child(8) > li');
      //   let performInitial = false;
      //   for (let j = 0; j < els.length; j++) {
      //     if (performInitial) {
      //       menuBtn = await getMenuBtn();
      //       await menuBtn.click();
      //       if (menuBtn) {
      //         menu = await getMenu();
      //         categoryBtn = await getMobileBtn();
      //         await categoryBtn.click();
      //         els = await page.$$(`#hmenu-content > ul:nth-child(8) > li`);
      //       }
      //     }
      //     try {
      //       performInitial = false;
      //       const link = await els[j].$eval('a', (a) => a.getAttribute('href'));
      //       if (link?.includes('node=')) {
      //         let mobileBtnn;
      //         mobileBtnn = await page.waitForSelector(
      //           `#hmenu-content > ul:nth-child(8) > li:nth-child(${j}) > a`,
      //           {
      //             visible: true,
      //             waitUntil: 'load',
      //             waitUntil: 'domcontentloaded',
      //           }
      //         );
      //         await mobileBtnn.click();
      //         await page.waitForNavigation({
      //           waitUntil: 'domcontentloaded',
      //         });
      //         performInitial = true;
      //         try {
      //           let seeAllBtn = await page.waitForSelector(
      //             '#apb-desktop-browse-search-see-all',
      //             { visible: true }
      //           );
      //           await seeAllBtn.click();
      //           await page.waitForNavigation({
      //             waitUntil: 'domcontentloaded',
      //           });
      //         } catch (error) {
      //           console.log('cant find see all button');
      //         }

      //         await page.waitForSelector('.a-link-normal', {
      //           visible: true,
      //         });
      //         const hrefArray = await page.$$eval(
      //           '.a-link-normal',
      //           (elements) => {
      //             return elements.map((element) =>
      //               element.getAttribute('href')
      //             );
      //           }
      //         );
      //         const links = hrefArray.toString();
      //         const matchLink = links.split('dp/');
      //         let extractedStrings = matchLink.map((link) => {
      //           const endIndex = link.indexOf('/');
      //           return endIndex !== -1 ? link.substring(0, endIndex) : link;
      //         });
      //         let uniqueArr = Array.from(new Set(extractedStrings));
      //         uniqueArr = uniqueArr.filter((item) => item);
      //         for (let k = 0; k < uniqueArr.length > 0; k++) {
      //           try {
      //             const domain = 'in';
      //             const data = await ScraperHelper.scrapeAmazonProduct(
      //               uniqueArr[k],
      //               domain
      //             );
      //           } catch (error) {
      //             console.log('error in amazon product asin = ' + uniqueArr[k]);
      //           }
      //         }
      //         urls.productId = uniqueArr;
      //       }
      //     } catch (error) {
      //       continue;
      //     }
      //   }
      // }
      // attempt = 0;
      // await gotoPage(page, attempt);
      // await delay(500);
      
      // menuBtn = await getMenuBtn();
      // await menuBtn.click();
      // if (menuBtn) {
      //   categoryBtn = await getElectronicsBtn();
      //   await categoryBtn.click();
      //   let els = await page.$$('#hmenu-content > ul:nth-child(9) > li');
      //   let performInitial = false;
      //   for (let j = 0; j < els.length; j++) {
      //     if (performInitial) {
      //       menuBtn = await getMenuBtn();
      //       await menuBtn.click();
      //       if (menuBtn) {
      //         // menu = await getMenu();
      //         categoryBtn = await getElectronicsBtn();
      //         await categoryBtn.click();
      //         els = await page.$$(`#hmenu-content > ul:nth-child(9) > li`);
      //       }
      //     }
      //     try {
      //       performInitial = false;
      //       const link = await els[j].$eval('a', (a) => a.getAttribute('href'));
      //       if (link?.includes('node=')) {
      //         let mobileBtnn;
      //         mobileBtnn = await page.waitForSelector(
      //           `#hmenu-content > ul:nth-child(9) > li:nth-child(${j}) > a`,
      //           {
      //             visible: true,
      //             waitUntil: 'load',
      //             waitUntil: 'domcontentloaded',
      //           }
      //         );
      //         await mobileBtnn.click();
      //         await page.waitForNavigation({
      //           waitUntil: 'domcontentloaded',
      //         });
      //         performInitial = true;
      //         try {
      //           let seeAllBtn = await page.waitForSelector(
      //             '#apb-desktop-browse-search-see-all',
      //             { visible: true }
      //           );
      //           await seeAllBtn.click();
      //           await page.waitForNavigation({
      //             waitUntil: 'domcontentloaded',
      //           });
      //         } catch (error) {
      //           console.log('cant find see all button');
      //         }

      //         await page.waitForSelector('.a-link-normal', {
      //           visible: true,
      //         });
      //         const hrefArray = await page.$$eval(
      //           '.a-link-normal',
      //           (elements) => {
      //             return elements.map((element) =>
      //               element.getAttribute('href')
      //             );
      //           }
      //         );
      //         const links = hrefArray.toString();
      //         const matchLink = links.split('dp/');
      //         let extractedStrings = matchLink.map((link) => {
      //           const endIndex = link.indexOf('/');
      //           return endIndex !== -1 ? link.substring(0, endIndex) : link;
      //         });
      //         let uniqueArr = Array.from(new Set(extractedStrings));
      //         uniqueArr = uniqueArr.filter((item) => item);
      //         for (let k = 0; k < uniqueArr.length > 0; k++) {
      //           try {
      //             const domain = 'in';
      //             const data = await ScraperHelper.scrapeAmazonProduct(
      //               uniqueArr[k],
      //               domain
      //             );
      //           } catch (error) {
      //             console.log('error in amazon product asin = ' + uniqueArr[k]);
      //           }
      //         }
      //         urls.productId = uniqueArr;
      //       }
      //     } catch (error) {
      //       continue;
      //     }
      //   }
      // }
      await browser.close();
      return {
        status: 200,
        message: 'Successfully fetched href URLs',
        data: urls,
      };
    } catch (error) {
      await browser.close();
      return {
        status: 500,
        message: 'INTERNAL SERVER ERROR',
        data: error,
      };
    }
  },
  searchAmazonProducts: async ({ query, category_id }) => {
    const oxylabsData =
      config.env.oxylabxUsername + ':' + config.env.oxylabsPassword;
    const category = await CategoryModel.findById(category_id);
    try {
      let buff = new Buffer(oxylabsData);
      let oxylabsConfig = buff.toString('base64');

      let data = JSON.stringify({
        source: 'amazon_search',
        domain: 'in',
        query,
        parse: true,
        context: [
          {
            key: 'category_id',
            value: category.amazon_id,
          },
        ],
      });

      let config = {
        method: 'post',
        url: 'https://realtime.oxylabs.io/v1/queries',
        headers: {
          'Content-Type': 'application/json',
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
                    price: parseFloat(organic[i].price),
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
                price: parseFloat(organic[i].price),
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
            message: error.message ? error.message : 'Error in OXYLABS API',
          };
        });
      return {
        status: 200,
        message: 'Successfull',
        response: 'Record Fetched Successfully',
        data: response,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : 'INTERNAL SERVER ERROR',
      };
    }
  },
  scrapeFlipkartProduct: ScraperHelper.scrapeFlipkartProduct,
  scrapeFlipkartProductList: async () => {
    try {
      const pageLink = 'https://www.flipkart.com';
      const categoriesLink = [];
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto(pageLink, {
        waitUntil: 'networkidle0',
      });

      const modalClose = await page.waitForSelector(
        'body > div.fbDBuK._3CYmv5 > div > span',
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
            '#container > div > div._331-kn > div > div > span:nth-child(1)',
            { visible: true }
          );
          if (electronicBtn) {
            electronicBtn.hover();

            const mobilesLink = await page.waitForSelector('[title="Mobiles"]');
            const siblingElements = await page.evaluate((element) => {
              const siblings = [];
              let sibling = element.nextElementSibling;
              while (sibling) {
                if (sibling.tagName === 'A' && sibling.href) {
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
                if (sibling.tagName === 'A' && sibling.href) {
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
          waitUntil: 'domcontentloaded',
          visible: true,
        });
        const hrefArray = await page.$$eval(
          '#container div div:nth-child(3) a',
          (elements) => {
            return elements?.map((element) => element.getAttribute('href'));
          }
        );
        const base_url = 'https://www.flipkart.com';
        const fullUrls = hrefArray.map((uri) => base_url + uri);
        const filteredUrls = fullUrls.filter((url) => url.includes('pid='));
        allData.push(filteredUrls);
      }
      const combinedArray = [].concat(...allData);
      const prodLink = [...new Set(combinedArray)];
      let productStore;
      for (let i = 0; i < prodLink.length; i++) {
        try {
          productStore = await ScraperHelper.scrapeFlipkartProduct(
            prodLink[i],
            page
          );
        } catch (error) {
          console.log('flipkart link failed');
          continue;
        }
      }
      await browser.close();
      return {
        status: 200,
        message: 'Successfull',
        response: 'Record Fetched Successfully',
        data: productStore,
      };
    } catch (error) {
      await browser.close();
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : 'INTERNAL SERVER ERROR',
      };
    }
  },

  // scrapeSnapdealProduct: async ({ url, supc, productId }) => {
  scrapeSnapdealProduct: async ({ products }) => {
    let browser;
    let data = [];
    try {
      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      for (let i = 0; i < products.length; i++) {
        const url = products[i].link;
        const supc = products[i].supc;
        const productId = products[i].productId;
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
        });

        const timeout = 500;
        try {
          let element = await page.waitForSelector(
            '#highlightSupc .h-content',
            {
              visible: true,
              timeout,
            }
          );
          // const productSUPC = await page.evaluate(
          //   (item) => item.textContent.replace("SUPC:", "").trim(),
          //   element
          // );
          const productSUPC = supc;
          const productImg = await page.$$eval('.cloudzoom', (items) =>
            items.map((item) => item.getAttribute('bigsrc'))
          );
          element = await page.waitForSelector('.pdp-e-i-head', {
            visible: true,
            timeout,
          });
          const productName = await page.evaluate(
            (item) => item.textContent.trim(),
            element
          );
          element = await page.waitForSelector('.payBlkBig', {
            visible: true,
            timeout,
          });
          const productPrice = await page.evaluate(
            (item) => item.textContent,
            element
          );
          const productCurrency = await page.$eval(
            "meta[itemprop='priceCurrency']",
            (item) => item.getAttribute('content')
          );
          element = await page.$$eval(
            '.bCrumbOmniTrack > span',
            (items, i) => items[i].textContent.trim(),
            1
          );
          let elements = await page.$$eval(
            '.highlightsTileContent .h-content',
            (items) => items.map((item) => item.textContent.trim())
          );
          const productDetailsData = elements.filter(
            (textContent) => textContent !== ''
          );
          const productDetails = {};
          for (let i = 0; i < productDetailsData.length; i++) {
            const data = productDetailsData[i].split(':');
            if (data.length >= 2) {
              productDetails[data[0]] = data[1];
            }
          }
          // productDetails["productId"] = productId;
          let productRatingText = null;
          try {
            element = await page.waitForSelector('.avrg-rating', {
              visible: true,
              timeout,
            });
            productRatingText = await page.evaluate(
              (item) => item.textContent,
              element
            );
          } catch {}
          const matches = productRatingText
            ? productRatingText.match(/[0-9.]+/g)
            : [];
          const productRating = matches.length ? matches[0] : null;

          element = await page.waitForSelector('#breadCrumbLabelIds', {
            timeout,
          });
          const catIDsText = await page.evaluate(
            (item) => item.textContent,
            element
          );
          const catIDs = catIDsText.split(',');
          elements = await page.$$eval(
            '#breadCrumbWrapper2 .containerBreadcrumb a',
            (items) => items.map((item) => item.textContent.trim())
          );
          const catLadder = [];
          for (let i = 0; i < elements.length; i++) {
            catLadder.push({
              id: catIDs[i].trim(),
              name: elements[i],
            });
          }
          let category = await CategoryModel.findOne({ ladder: catLadder });
          if (!category) {
            category = await CategoryModel.create({ ladder: catLadder });
          }

          if ((productName != '') & (productSUPC != '')) {
            const productData = {
              supc: productSUPC,
              title: productName,
              category_id: category,
              img_url: productImg,
              price: productPrice,
              currency: productCurrency,
              rating: productRating,
              product_details: productDetails,
              url: url,
              store: 'Snapdeal',
              productId: productId,
            };
            let product = await ProductModel.findOne({ supc: productSUPC });
            if (!product) {
              product = await ProductModel.create(productData);
            } else {
              product = await ProductModel.updateOne(
                { supc: productSUPC },
                productData
              );
            }
            data.push({
              product: productData,
            });
          }
        } catch (error) {}
      }
      await browser.close();
      return {
        status: 200,
        message: 'Successfull',
        response: 'Record Fetched Successfully',
        data: data.length,
      };
    } catch (error) {
      browser && (await browser.close());
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : 'INTERNAL SERVER ERROR',
      };
    }
  },

  scrapeSnapdealProductList: async ({ url, limit }) => {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      });

      const timeout = 600000;
      let element = await page.waitForSelector('#products', {
        timeout: 3000,
      });
      element = await page.waitForSelector('#see-more-products', {
        timeout,
      });
      let visibilityStyle = await page.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return computedStyle.visibility;
      }, element);
      let isLoading = await page.evaluate((el) => {
        return el.getAttribute('class').indexOf('hidden') < 0;
      }, element);
      let products = await page.$$eval(
        'section .product-tuple-listing',
        (items) => {
          return items.map((item) => {
            const productId = item.getAttribute('id').trim();
            const supc = item.getAttribute('supc').trim();
            const linkElem = item.querySelector('.product-tuple-image a');
            const link = linkElem ? linkElem.href : null;
            return {
              productId,
              supc,
              link,
            };
          });
        }
      );
      while (
        (visibilityStyle == 'visible' || isLoading) &&
        products.length < limit
      ) {
        products = await page.$$eval(
          'section .product-tuple-listing',
          (items) => {
            return items.map((item) => {
              const productId = item.getAttribute('id').trim();
              const supc = item.getAttribute('supc').trim();
              const linkElem = item.querySelector('.product-tuple-image a');
              const link = linkElem ? linkElem.href : null;
              return {
                productId,
                supc,
                link,
              };
            });
          }
        );

        if (visibilityStyle == 'visible') element.click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          element = await page.waitForSelector('.sd-loader-see-more', {
            timeout,
          });
          isLoading = await page.evaluate((el) => {
            return el.getAttribute('class').indexOf('hidden') < 0;
          }, element);
        } catch {}
        element = await page.waitForSelector('#see-more-products', {
          timeout,
        });
        visibilityStyle = await page.evaluate((el) => {
          const computedStyle = window.getComputedStyle(el);
          return computedStyle.visibility;
        }, element);
      }

      // const products = await page.$$eval(
      //   "section .product-tuple-listing",
      //   (items) => {
      //     return items.map((item) => {
      //       const productId = item.getAttribute("id").trim();
      //       const supc = item.getAttribute("supc").trim();
      //       const linkElem = item.querySelector(".product-tuple-image a");
      //       const link = linkElem ? linkElem.href : null;
      //       return {
      //         productId,
      //         supc,
      //         link,
      //       };
      //     });
      //   }
      // );

      await browser.close();
      return {
        status: 200,
        message: 'Successfull',
        response: 'Record Fetched Successfully',
        data: products,
      };
    } catch (error) {
      browser && (await browser.close());
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : 'INTERNAL SERVER ERROR',
      };
    }
  },

  scrapeSnapdealCategory: async (url) => {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      });

      let data = [];
      const timeout = 500;
      await page.waitForSelector('.leftNavigationLeftContainer li.navlink', {
        timeout,
      });
      const elementHandles = await page.$$(
        '.leftNavigationLeftContainer li.navlink'
      );
      for (let i = 0; i < elementHandles.length; i++) {
        const handle = elementHandles[i];
        const subdata = await page.evaluate((element) => {
          const mainCatText = element
            .querySelector('a span.catText')
            .textContent.trim();
          const catChildren = element.querySelectorAll('.colDataInnerBlk a');
          let categories = [];
          let headingText = '';
          let catText = '';
          let link = '';
          let swCatText = 1;
          for (let j = 0; j < catChildren.length; j++) {
            const subitem = catChildren[j];
            if (subitem.href.indexOf('sort=plrty') >= 0) {
              link = subitem.href;
            } else {
              const idx = subitem.href.indexOf('#bcrumbLabelId');
              if (idx < 0) {
                link = subitem.href + '?sort=plrty';
              } else {
                link =
                  subitem.href.slice(0, idx) +
                  substring +
                  subitem.href.slice(idx);
              }
            }
            if (link.indexOf('http') < 0) {
              continue;
            }
            const catTextElem = subitem.querySelector('span');
            if (catTextElem.getAttribute('class').indexOf('heading') >= 0) {
              // headingText = catTextElem.textContent.trim();
              // if (headingText != "") {
              //   swCatText = 0;
              //   categories.push({
              //     mainCat: mainCatText,
              //     catText: headingText,
              //     catLink: link,
              //   });
              // }
            } else if (
              swCatText &&
              catTextElem.getAttribute('class').indexOf('link') >= 0
            ) {
              catText = catTextElem.textContent.trim();
              if (catText != '') {
                categories.push({
                  mainCat: mainCatText,
                  catText: catText,
                  catLink: link,
                });
              }
            } else if (catTextElem.getAttribute('class').indexOf('view') >= 0) {
            }
          }
          return categories;
        }, handle);
        data.push(...subdata);
      }
      await browser.close();
      return {
        status: 200,
        message: 'Successfull',
        response: 'Record Fetched Successfully',
        data: data,
      };
    } catch (error) {
      throw {
        status: error?.status ? error?.status : 500,
        message: error?.message ? error?.message : 'INTERNAL SERVER ERROR',
      };
    }
  },
};
