const User = require("../models/user.model");
const Session = require("../models/session.model");
const uuid = require("uuid");

const jwt = require("jsonwebtoken");
const tokenUtils = require("../utils/tokenUtils");
exports.create = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a user
  const user = new User({
    username: req.body.username,
    role: "CUSTOMER",
  });
  user.password = user.generateHash(req.body.password);
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the user.",
      });
    else {
      res.send(userwithoutPassword(data));
    }
  });
};

exports.findAll = (req, res) => {
  const token = req.headers["token"];
  if (token && token.role && token.role === "ADMIN") {
    User.find()
      .then((user) => {
        const updatedUser = user.map((user) => userwithoutPassword(user));
        res.send(updatedUser);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving user.",
        });
      });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};

exports.findOne = (req, res) => {
  const token = req.headers["token"];
  if (
    token &&
    token.role &&
    (token.role === "ADMIN" || token.sub === req.params.userId)
  ) {
    User.findById(req.params.userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.params.userId}.`,
          });
        } else {
          res.status(500).send({
            message: "Error retrieving user with id " + req.params.userId,
          });
        }
      } else {
        const userResp = userwithoutPassword(data);
        res.send(userResp);
      }
    });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};

const userwithoutPassword = (data) => {
  return {
    _id: data._id,
    username: data.username,
    role: data.role,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  const token = req.headers["token"];
  if (
    token &&
    token.role &&
    (token.role === "ADMIN" || token.sub === req.params.userId)
  ) {
    User.findByIdAndUpdate(
      req.params.userId,
      {
        username: req.body.username,
        role: req.body.role,
        password: req.body.password,
      },
      { new: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: "user not found with id " + req.params.userId,
          });
        }
        res.send(userwithoutPassword(data));
      })
      .catch((err) => {
        if (err.kind === "ObjectId") {
          return res.status(404).send({
            message: "user not found with id " + req.params.userId,
          });
        }
        return res.status(500).send({
          message: "Error updating note with id " + req.params.userId,
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
  if (
    token &&
    token.role &&
    (token.role === "ADMIN" || token.sub === req.params.userId)
  ) {
    User.findByIdAndRemove(req.params.userId)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: "user not found with id " + req.params.userId,
          });
        }
        res.send({ message: "user deleted successfully!" });
      })
      .catch((err) => {
        if (err.kind === "ObjectId" || err.name === "NotFound") {
          return res.status(404).send({
            message: "user not found with id " + req.params.userId,
          });
        }
        return res.status(500).send({
          message: "Could not delete user with id " + req.params.userId,
        });
      });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};

exports.getToken = (req, res) => {
  if (req.body.grant_type == "password") {
    User.findOne({ username: req.body.user_name }, function (err, user) {
      if (user && !user.validPassword(req.body.password)) {
        return res.status(400).send({
          error: {
            status: 400,
            message: "password mismatch",
          },
        });
      } else {
        if (user) {
          const respUser = {
            sub: user._id,
            username: user.username,
            role: user.role,
          };
          const accessToken = tokenUtils.generateToken(respUser);
          const session = new Session({
            userId: user._id,
            refreshToken: uuid.v1(),
          });
          Session.create(session, (err, data) => {
            if (err)
              res.status(500).send({
                message:
                  err.message ||
                  "Some error occurred while creating the session.",
              });
            else {
              var expiresIn = new Date();
              expiresIn.setMinutes(expiresIn.getMinutes() + 30);
              const token = {
                userId: data.userId,
                username: user.username,
                role: user.role,
                accessToken: accessToken,
                refreshToken: data.refreshToken,
                expiresIn: expiresIn,
              };
              console.log("token", token);
              res.send(token);
            }
          });
        } else {
          res.status(400).send({
            error: {
              status: 400,
              message: "invalid user name",
            },
          });
        }
      }
    });
  } else if (req.body.grant_type == "refresh_token") {
    Session.findOne(
      {
        refreshToken: req.body.refresh_token,
      },
      function (err, session) {
        if (err && err.kind === "not_found") {
          res.status(404).send({
            message: `Not token was found  with  ${req.body.refresh_token}.`,
          });
        }
        if (session) {
          User.findById(session.userId, (err, data) => {
            if (err) {
              if (err.kind === "not_found") {
                res.status(404).send({
                  message: `Not found user with id ${session.userId}.`,
                });
              } else {
                res.status(500).send({
                  message: "Error retrieving user with id " + session.userId,
                });
              }
            } else {
              const respUser = {
                sub: data._id,
                username: data.username,
                role: data.role,
              };
              const accessToken = tokenUtils.generateToken(respUser);
              var expiresIn = new Date();
              expiresIn.setMinutes(expiresIn.getMinutes() + 30);
              const token = {
                userId: data._id,
                accessToken: accessToken,
                refreshToken: req.body.refresh_token,
                expiresIn: expiresIn,
              };
              res.send(token);
            }
          });
        }
      }
    );
  } else {
    res.status(400).send({ message: "invalid grant type" });
  }
};

exports.revokeToken = (req, res) => {
  const token = req.headers["token"];
  if (
    token &&
    token.role &&
    (token.role === "ADMIN" || token.sub === req.params.userId)
  ) {
    Session.findOne({ refreshToken: req.body.refreshToken }, function (
      err,
      session
    ) {
      Session.findByIdAndRemove(session._id)
        .then(() => {
          res.send({ message: "logged out successfully!" });
        })
        .catch((err) => {
          return res.status(500).send({
            message: "Could not refresh token with id " + session._id,
          });
        });
    });
  } else {
    res.status(403).send({
      message: "UnAuthorized Access",
    });
  }
};
