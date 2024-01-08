import { ComparisonService } from "../../services/index.js";
import { httpResponse } from "../../utils/index.js";

const controller = {
  createComparisons: async (req, res) => {
    try {
      const data = await ComparisonService.createComparisons(req.body);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  getComparisons: async (req, res) => {
    try {
      const data = await ComparisonService.getComparisons(req.query);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  getComparisonById: async (req, res) => {
    try {
      const data = await ComparisonService.getComparisonById(req.params.id);
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  updateComparison: async (req, res) => {
    try {
      const data = await ComparisonService.updateComparison(
        req.params.id,
        req.body
      );
      return httpResponse.SUCCESS(res, data);
    } catch (error) {
      if (error.status == 400) {
        return httpResponse.BAD_REQUEST(res, error.response);
      }
      return httpResponse.INTERNAL_SERVER_ERROR(res, error);
    }
  },
  deleteComparison: async (req, res) => {
    try {
      const data = await ComparisonService.deleteComparison(req.params.id);
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
