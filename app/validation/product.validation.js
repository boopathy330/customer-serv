const { celebrate, Joi } = require("celebrate");

module.exports = {
  productSchema: celebrate({
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).options({ allowUnknown: true }),
    body: {
      name: Joi.string().min(1).max(20).required(),
      desc: Joi.string().min(1).max(40).required(),
    },
  }),
};
