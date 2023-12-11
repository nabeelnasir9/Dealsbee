import axios from "axios";

const THREAD_NUM = 5;
const currentThreadNum = 0;

axios
  .post("http://localhost:8000/scraper/snapdeal/categories", {})
  .then((response) => {
    // console.log(response.data.data);
    for (let category of response.data.data.reverse()) {
      // console.log(category);
      axios
        .post("http://localhost:8000/scraper/snapdeal/list", {
          url: category.catLink,
        })
        .then((response) => {
          for (let product of response.data.data) {
            // console.log(product);
            axios
              .post("http://localhost:8000/scraper/snapdeal/", {
                url: product.link,
                supc: product.supc,
                productId: product.productId,
              })
              .then((response) => {
                console.log(
                  `A product ${response.data.data.product.title} saved`
                );
              })
              .catch((error) => {
                console.log(error);
              });
            // break;
          }
        })
        .catch((error) => {
          console.log(error);
        });
      break;
    }
  })
  .catch((error) => {
    console.log(error);
  });
