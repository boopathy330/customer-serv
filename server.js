const express = require("express");
const bodyParser = require("body-parser");
const dbConfig = require("./app/configs/db.config.js");
const mongoose = require("mongoose");
const routes = require("./app/routes/index.js");
const tokenUtils = require("./app/utils/tokenUtils");
const app = express();
var cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
require("dotenv").config();

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

app.use("/", (req, res, next) => {
  if (req.headers["authorization"]) {
    var token = req.headers["authorization"];
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
      verifyDetails = tokenUtils.verifyToken(token);
      console.log("verifyDetails", verifyDetails);
      if (verifyDetails) {
        const token = {
          sub: verifyDetails.sub,
          username: verifyDetails.username,
          role: verifyDetails.role,
        };
        req.headers["token"] = token;
        next();
      } else {
        res
          .status(401)
          .send({ error: { status: 401, message: "UnAuthorized Access" } });
      }
    } else {
      res.send({ error: { status: 401, message: "invalid token format" } });
    }
  } else {
    req.user = { token: false };
    next();
  }
});

app.get("/", (req, res) => {
  res.json({ message: "CustomerServ API" });
});

//add routes
// app.use(routes);
require("./app/routes/user.route.js")(app);
require("./app/routes/product.route.js")(app);
require("./app/routes/transaction.route.js")(app);

app.use(function (err, req, res, next) {
  var errResponse = {};
  var error = {};
  var message = "Oops..! Something Went Wrong!!";
  var code = 500;
  if (err) {
    console.log("====================================");
    console.log(err);
    console.log("====================================");
    switch (err.name) {
      case "JsonWebTokenError":
        code = 403;
        message = "Invaid signature";
        break;
      case "TokenExpiredError":
        code = 401;
        message = "token Expired";
        break;
      case "ValidationError":
        code = 400;
        message = err.errors[0].messages;
        break;
      case "Error":
        code = 400;
        message = err.message;
        break;
    }
  }
  // if (message === "Oops..! Something Went Wrong!!") {
  //   console.log('====================================');
  //   console.log(err);
  //   console.log('====================================');
  // }
  error["status"] = code;
  error["message"] = message;
  errResponse["error"] = error;
  res.status(code).send(errResponse);
});

// set port, listen for requests
app.listen(3001, () => {
  console.log("Server is running on port 3001.");
});
