const config = require("../../../config/keys");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const compose = require("composable-middleware");
const User = require("../user/user.model");
const validateJwt = expressJwt({ secret: config.secretOrKey });

function isAuthenticated() {
  return (
    compose()
      .use(function(req, res, next) {
        validateJwt(req, res, next);
        if (req.query && req.query.hasOwnProperty("access_token")) {
          req.headers.authorization = "Bearer " + req.query.access_token;
        }
      })
      .use(function(req, res, next) {
        User.findById(req.user.id, function(err, user) {
          if (err) return next(err);
          if (!user) return res.send(401);

          req.user = user;
          next();
        });
      })
  );
}


function hasRole(roleRequired) {
  if (!roleRequired) throw new Error("Required role needs to be set");

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (
        config.userRoles.indexOf(req.user.role) >=
        config.userRoles.indexOf(roleRequired)
      ) {
        next();
      } else {
        res.send(403);
      }
    });
}



function isLocalStrategy() {
  return compose().use(function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if (!user) return res.send(401);

      if (user.provider === "local") next();
      else res.send(400, "Only can change password on local strategy");
    });
  });
}


function signToken(id) {
  return jwt.sign({ _id: id }, config.secretOrKey);
}


function setTokenCookie(req, res) {
  if (!req.user)
    return res.json(404, {
      message: "Something went wrong, please try again."
    });
  const token = signToken(req.user._id);
  res.cookie("token", JSON.stringify(token));
  res.redirect("/");
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.isLocalStrategy = isLocalStrategy;
