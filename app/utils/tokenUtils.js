const jwt = require("jsonwebtoken");

module.exports.generateToken = (respUser) => {
  return jwt.sign(respUser, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: 1800,
  });
};

module.exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
  });
};
