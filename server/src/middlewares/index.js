const ratingMiddleware = require("./rating-middleware");
const authMiddleware = require("./auth-middleware");
const signupMiddleware = require("./signup-middleware");
const storeMiddleware = require("./store-middleware");
const adminMiddleware = require("./admin-middleware");

module.exports={
  signupMiddleware,
  authMiddleware,
  ratingMiddleware,
  storeMiddleware,
  adminMiddleware
}