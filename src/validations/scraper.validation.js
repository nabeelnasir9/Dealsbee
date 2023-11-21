import Joi from "joi";

export const scraperValidationSchema = {
  post: {
    body: Joi.object().keys({
      url: Joi.string().required(),
    }),
  },
  patch: {
    body: Joi.object().keys({
      company_name: Joi.string(),
      logo: Joi.string().allow(""),
      phone_number: Joi.string().allow(""),
      email: Joi.string().email().allow(""),
      social_media: Joi.object(),
      text: Joi.array(),
      industry: Joi.string().allow(""),
      products: Joi.array(),
      services: Joi.array(),
    }),
  },
};
