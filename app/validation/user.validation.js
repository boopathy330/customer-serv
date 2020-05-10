const { celebrate, Joi } = require("celebrate");

module.exports = {
  userCreateSchema: celebrate({
    body: {
      username: Joi.string()
        .regex(/^[a-z\d\-_\s]+$/i)
        .min(1)
        .max(20)
        .required(),
      password: Joi.string().min(1).max(40).required(),
    },
  }),
  userLoginSchema: celebrate({
    body: {
      user_name: Joi.string()
        .regex(/^[a-z\d\-_\s]+$/i)
        .min(1)
        .max(20)
        .required(),
      grant_type: Joi.string().valid("password", "refresh_token"),
      password: Joi.string(),
      refresh_token: Joi.string(),
    },
  }),
};
