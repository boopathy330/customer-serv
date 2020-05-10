const validation = require("../validation/user.validation");

module.exports = (app) => {
  const user = require("../controllers/user.controller.js");

  app.post("/v1/user", validation.userCreateSchema, user.create);

  app.get("/v1/user", user.findAll);

  app.get("/v1/user/:userId", user.findOne);

  app.put("/v1/user/:userId", user.update);

  app.delete("/v1/user/:userId", user.delete);

  app.post("/v1/user/auth/token", validation.userLoginSchema, user.getToken);

  app.post("/v1/user/revoke/token", user.revokeToken);
};
