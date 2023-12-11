// main.js
import axios from "axios";

let isDone = 1;
const productList = [];

async function fetchCategoryData() {
  try {
    const response = await axios.post(
      "http://localhost:8000/scraper/snapdeal/categories",
      {}
    );
    return response.data.data;
  } catch (error) {
    // console.error(error);
    return []; // Return an empty array on error
  }
}

async function processCategory(category) {
  try {
    const response = await axios.post(
      "http://localhost:8000/scraper/snapdeal/list",
      {
        url: category.catLink,
      }
    );
    return response.data.data;
    // for (let product of response.data.data) {
    //     console.log(product);
    //     await processProduct(product);
    // }
  } catch (error) {
    // console.error(error);
    return [];
  }
}

async function processProduct(params) {
  const { products } = params;
  try {
    const response = await axios.post(
      "http://localhost:8000/scraper/snapdeal/",
      {
        products,
      }
    );
    console.log(`A products ${response.data.data} saved`);
  } catch (error) {
    console.error(error);
  }

  // for(let i = 0 ; i < products.length; ++ i) {
  //     const product = products[i];
  //     try {
  //         const response = await axios.post("http://localhost:8000/scraper/snapdeal/", {
  //             url: product.link,
  //             supc: product.supc,
  //             productId: product.productId,
  //         });
  //         console.log(`A product ${response.data.data[0].product.title} saved`);
  //     } catch (error) {
  //         console.error(error);
  //     }
  // }
  isDone = 1;
}

async function subprocess() {
  while (1) {
    const products = productList.pop();
    if (products) {
      await processProduct({ products });
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

(async function main() {
  subprocess();
  const categories = await fetchCategoryData();
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    console.log(category);
    const products = await processCategory(category);
    // while (!isDone) {
    //     await new Promise((resolve) => setTimeout(resolve, 1000));
    // }
    // isDone = 0;
    productList.push(products);
  }
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  // while (!isDone);
  // console.log("Main Process is ended");
})();
