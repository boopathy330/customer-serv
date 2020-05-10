const validation = require("../validation/product.validation");

module.exports = (app) => {
  const product = require("../controllers/product.controller.js");

  app.post("/v1/product", validation.productSchema, product.create);

  app.get("/v1/product", product.findAll);

  app.get("/v1/product/:productId", product.findOne);

  app.put("/v1/product/:productId", validation.productSchema, product.update);

  app.delete("/v1/product/:productId", product.delete);
};
