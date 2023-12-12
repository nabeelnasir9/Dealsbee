// main.js
import axios from "axios";

let isDone = 0;
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
        limit: 300,
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
  // isDone = 1;
}

async function subprocess() {
  while (1) {
    const products = productList.pop();
    if (products) {
      await processProduct({ products });
    } else {
      if (isDone) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

(async function main() {
  subprocess();
  const categories = await fetchCategoryData();
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    if (category.mainCat == "Electronics") {
      const products = await processCategory(category);
      console.log(category, products.length);
      // while (!isDone) {
      //     await new Promise((resolve) => setTimeout(resolve, 1000));
      // }
      // isDone = 0;
      let tempList = [];
      for (let j = 0; j < products.length; j++) {
        tempList.push(products[j]);
        if (j && j % 500 == 0) {
          productList.push(tempList);
          tempList = [];
        }
      }
      if (tempList.length) {
        productList.push(tempList);
      }
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
  isDone = 1;
  // while (!isDone);
  // console.log("Main Process is ended");
})();
