const { celebrate, Joi } = require("celebrate");

module.exports = {
  transactionSchema: celebrate({
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).options({ allowUnknown: true }),
    body: {
      userId: Joi.string().required(),
      productId: Joi.array().items(Joi.string()),
    },
  }),
};
