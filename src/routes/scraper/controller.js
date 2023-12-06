import { ScraperService } from "../../services/index.js";
import { httpResponse } from "../../utils/index.js";

const controller = {
  scrapeAmazonProduct: async (req, res) => {
    try {
      const data = await ScraperService.scrapeAmazonProduct(req.body.productId);
      if (data?.status == 204) {
        return httpResponse.SUCCESS(res, data);
      }
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error?.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  scrapeAmazonProductList: async (req, res) => {
    try {
      const data = await ScraperService.scrapeAmazonProductList();
      if (data?.status == 204) {
        return httpResponse.SUCCESS(res, data);
      }
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error?.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  searchAmazonProducts: async (req, res) => {
    try {
      const data = await ScraperService.searchAmazonProducts(req.body);
      if (data?.status == 204) {
        return httpResponse.SUCCESS(res, data);
      }
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error?.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  scrapeFlipkartProduct: async (req, res) => {
    try {
      const data = await ScraperService.scrapeFlipkartProduct(req.body.url);
      if (data?.status == 204) {
        return httpResponse.SUCCESS(res, data);
      }
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error?.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  scrapeFlipkartProductList: async (req, res) => {
    try {
      const data = await ScraperService.scrapeFlipkartProductList();
      if (data?.status == 204) {
        return httpResponse.SUCCESS(res, data);
      }
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error?.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
};

export default controller;
