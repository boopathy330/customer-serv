const validation = require("../validation/transaction.validation");

module.exports = (app) => {
  const transaction = require("../controllers/transaction.controller.js");

  app.post("/v1/transaction", validation.transactionSchema, transaction.create);

  app.get("/v1/transaction", transaction.findAll);

  app.get("/v1/transaction/:transactionId", transaction.findOne);

  app.put(
    "/v1/transaction/:transactionId",
    validation.transactionSchema,
    transaction.update
  );

  app.delete("/v1/product/:productId", transaction.delete);
};
