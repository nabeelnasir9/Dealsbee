import { CategoryService } from "../../services/index.js";
import { httpResponse } from "../../utils/index.js";

const controller = {
  createCategory: async (req, res) => {
    try {
      const data = await CategoryService.createCategory(req.body);
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
  getCategory: async (req, res) => {
    try {
      const data = await CategoryService.getCategory(req.params.id);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },

  patchCategory: async (req, res) => {
    try {
      const data = await CategoryService.patchCategory(req.params.id, req.body);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const data = await CategoryService.deleteCategory(req.params.id);
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
