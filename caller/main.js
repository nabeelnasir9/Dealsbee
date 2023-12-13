// main.js
import axios from "axios";

let isDone = 0;
let isCompleted = 0;
const productList = [];

async function fetchCategoryData() {
  try {
    const response = await axios.post(
      "http://localhost:8000/scraper/snapdeal/categories",
      {}
    );
    return response.data.data;
  } catch (error) {
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
  } catch (error) {
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
}

async function subprocess() {
  isCompleted = 0;
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
  isCompleted = 1;
}

(async function main() {
  while (1) {
    isDone = 0;
    subprocess();
    const categories = await fetchCategoryData();
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const products = await processCategory(category);
      console.log(category, products.length);
      productList.push(products);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
    isDone = 1;
    while (!isCompleted) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
})();
