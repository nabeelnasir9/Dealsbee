import { ProductService } from "../../services/index.js";
import { httpResponse } from "../../utils/index.js";

const controller = {
  getProducts: async (req, res) => {
    try {
      const data = await ProductService.getProducts(req.query);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  getProductById: async (req, res) => {
    try {
      const data = await ProductService.getProductById(req.params.id);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  updateProduct: async (req, res) => {
    try {
      const data = await ProductService.updateProduct(req.params.id, req.body);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const data = await ProductService.deleteProduct(req.params.id);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
};

export default controller;
