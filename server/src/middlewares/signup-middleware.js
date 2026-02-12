const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/error/app-error");
const { ErrorResponse } = require("../utils/common");
const { validate } = require("../utils/validations")
const signupMiddleware = async (req, res, next) => {
  try {
    req.body.name = req.body.name?.trim();
    req.body.email = req.body.email?.trim();
    req.body.password = req.body.password?.trim();
    req.body.address = req.body.address?.trim();
    validate.validateSignup(req.body);
    next();
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error.message, error));
  }
}

module.exports = signupMiddleware;