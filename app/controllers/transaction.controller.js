const Transction = require("../models/transaction.model");
const Product = require("../models/product.model");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
  const token = req.headers["token"];
  if (token && token.sub) {
    const trasaction = new Transction({
      productId: req.body.productId,
      userId: token.sub,
    });
    const validate = validateProducts(req.body.productId, res);
    Transction.create(trasaction, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating the Transaction.",
        });
      else res.send(data);
    });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};

const validateProducts = (productList, res) => {
  Product.find({
    _id: productList,
  })
    .then((product) => {
      return null;
    })
    .catch((err) => {
      const errMsg = {
        message: "invalid Product id" + err.message.split('"')[1],
      };
      console.log("err".err);
      res.status(400, errMsg);
      return errMsg;
    });
};

exports.findAll = (req, res) => {
  const token = req.headers["token"];
  console.log("token", token);
  const match = {};
  if (req.query.userId || token.role === "CUSTOMER") {
    console.log("iam cmg inside");
    userId = token.role == "CUSTOMER" ? token.sub : req.query.userId;
    match["userId"] = mongoose.Types.ObjectId(userId);
  }
  if (req.query.createdAt) {
    var start = new Date(req.query.createdAt);
    start.setHours(0, 0, 0, 0);

    var end = new Date(req.query.createdAt);
    end.setHours(23, 59, 59, 999);
    match["createdAt"] = {
      $gte: start,
      $lte: end,
    };
  }
  const aggregate = [
    { $match: match },
    { $unwind: "$productId" },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productObjects",
      },
    },
  ];

  if (token) {
    Transction.aggregate(aggregate)
      .then((trasaction) => {
        res.send(trasaction);
      })
      .catch((err) => {
        // console.log("error", err);
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving transaction.",
        });
      });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};
exports.findOne = (req, res) => {
  Transction.findById(req.params.trasactionId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found trasaction with id ${req.params.trasactionId}.`,
        });
      } else {
        res.status(500).send({
          message:
            "Error retrieving trasaction with id " + req.params.trasactionId,
        });
      }
    } else res.send(data);
  });
};

exports.update = (req, res) => {
  const token = req.headers["token"];
  if (token && token.role && token.role === "ADMIN") {
    const trasaction = new Trasaction({
      productId: req.body.productId,
      userId: token.sub,
    });
    Transction.findByIdAndUpdate(req.params.trasactionId, product, {
      new: true,
    })
      .then((transaction) => {
        if (!transaction) {
          return res.status(404).send({
            message: "trasaction not found with id " + req.params.trasactionId,
          });
        }
        res.send(transaction);
      })
      .catch((err) => {
        if (err.kind === "ObjectId") {
          return res.status(404).send({
            message: "transaction not found with id " + req.params.trasactionId,
          });
        }
        return res.status(500).send({
          message: "Error updating note with id " + req.params.trasactionId,
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
    Transction.findByIdAndRemove(req.params.trasactionId)
      .then((transaction) => {
        if (!transaction) {
          return res.status(404).send({
            message: "transaction not found with id " + req.params.trasactionId,
          });
        }
        res.send({ message: "transaction deleted successfully!" });
      })
      .catch((err) => {
        if (err.kind === "ObjectId" || err.name === "NotFound") {
          return res.status(404).send({
            message: "transaction not found with id " + req.params.trasactionId,
          });
        }
        return res.status(500).send({
          message:
            "Could not delete transaction with id " + req.params.trasactionId,
        });
      });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};
