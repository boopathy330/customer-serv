const Product = require("../models/product.model");

exports.create = async (req, res) => {
  const token = req.headers["token"];
  if (token && token.role && token.role === "ADMIN") {
    const product = new Product({
      name: req.body.name,
      desc: req.body.desc,
    });
    Product.create(product, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Product.",
        });
      else res.send(data);
    });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};

exports.findAll = (req, res) => {
  Product.find()
    .then((product) => {
      res.send(product);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving product.",
      });
    });
};

exports.findOne = (req, res) => {
  Product.findById(req.params.productId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found product with id ${req.params.productId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving product with id " + req.params.productId,
        });
      }
    } else res.send(data);
  });
};

exports.update = (req, res) => {
  const token = req.headers["token"];
  if (token && token.role && token.role === "ADMIN") {
    const product = new Product({
      name: req.body.name,
      desc: req.body.desc,
    });
    Product.findByIdAndUpdate(req.params.productId, product, { new: true })
      .then((product) => {
        if (!product) {
          return res.status(404).send({
            message: "product not found with id " + req.params.productId,
          });
        }
        res.send(product);
      })
      .catch((err) => {
        if (err.kind === "ObjectId") {
          return res.status(404).send({
            message: "user not found with id " + req.params.productId,
          });
        }
        return res.status(500).send({
          message: "Error updating note with id " + req.params.productId,
        });
      });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};

exports.delete = (req, res) => {
  const token = req.headers["token"];
  if (token && token.role && token.role === "ADMIN") {
    Product.findByIdAndRemove(req.params.productId)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: "product not found with id " + req.params.productId,
          });
        }
        res.send({ message: "Product deleted successfully!" });
      })
      .catch((err) => {
        if (err.kind === "ObjectId" || err.name === "NotFound") {
          return res.status(404).send({
            message: "product not found with id " + req.params.productId,
          });
        }
        return res.status(500).send({
          message: "Could not delete product with id " + req.params.productId,
        });
      });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};
