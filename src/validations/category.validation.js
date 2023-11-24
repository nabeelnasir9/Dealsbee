import Joi from "joi";

export const categoryValidationSchema = {
  post: {
    body: Joi.object().keys({
      title: Joi.string().required(),
      amazon_id: Joi.string(),
      url: Joi.string(),
    }),
  },
  patch: {
    body: Joi.object().keys({
      title: Joi.string().required(),
      amazon_id: Joi.string(),
      url: Joi.string(),
    }),
  },
};
