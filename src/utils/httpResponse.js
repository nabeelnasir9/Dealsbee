//HTTP Responses
import { ErrorCodesMeta } from "../constants/error-codes.js";
import { SuccessCodesMeta } from "../constants/success-codes.js";
export const httpResponse = {
  SUCCESS: (res, data = {}) => {
    res.status(200).json({
      ...data,
    });
  },
  CREATED: (res, data = {}, message = SuccessCodesMeta.CREATED.message) => {
    res.status(201).json({
      status: 201,
      response: "Created",
      message,
      data,
    });
  },
  ACCEPTED: (res, data = {}, message = SuccessCodesMeta.ACCEPTED.message) => {
    res.status(202).json({
      status: 202,
      response: "Accepted",
      message,
      data,
    });
  },
  NON_AUTHORITATIVE: (
    res,
    data = {},
    message = SuccessCodesMeta.NON_AUTHORITATIVE.message
  ) => {
    res.status(203).json({
      status: 203,
      response: "Non-Authoritative Information",
      message,
      data,
    });
  },
  NO_CONTENT: (res, data = {}) => {
    res.status(204).json({
      ...data,
    });
  },
  NOT_MODIFIED: (
    res,
    data = {},
    message = SuccessCodesMeta.NOT_MODIFIED.message
  ) => {
    res.status(304).json({
      status: 304,
      response: "Not Modified.",
      message,
      data,
    });
  },
  BAD_REQUEST: (res, data = {}) => {
    res.status(400).json({
      status: 400,
      message: "Bad Request",
      // response: data,
    });
  },
  UNAUTHORIZED: (res, data = {}) => {
    res.status(401).json({
      status: 401,
      message: "Unauthorized",
      response: data,
    });
  },
  PAYMENT_REQUIRED: (
    res,
    data = {},
    message = ErrorCodesMeta.PAYMENT_REQUIRED.message
  ) => {
    res.status(402).json({
      status: 402,
      response: "Payment Required",
      message,
      data,
    });
  },
  FORBIDDEN: (res, data = {}, message = ErrorCodesMeta.FORBIDDEN.message) => {
    res.status(403).json({
      status: 403,
      response: "Forbidden",
      message,
      data,
    });
  },
  NOT_FOUND: (res, data = {}) => {
    res.status(404).json({
      status: 404,
      message: "Not Found",
      response: data,
    });
  },
  CONFLICT: (res, data = {}) => {
    res.status(409).json({
      status: 409,
      message: "Conflict",
      response: data,
    });
  },
  NOT_ALLOWED: (
    res,
    data = {},
    message = ErrorCodesMeta.NOT_ALLOWED.message
  ) => {
    res.status(405).json({
      status: 405,
      response: "Method not allowed.",
      message,
      data,
    });
  },
  INTERNAL_SERVER_ERROR: (
    res,
    data = {},
    message = ErrorCodesMeta.INTERNAL_SERVER_ERROR.message
  ) => {
    res.status(500).json({
      status: 500,
      response: "Internal Server Error",
      message,
      data,
    });
  },
};
