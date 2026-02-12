const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { AuthServices, UserServices } = require("../services");

const createUser = async (req, res) => {
  try {
    const user = await AuthServices.signUp(req.body);
    return res.status(StatusCodes.CREATED).json(SuccessResponse(user, "User created successfully"));
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error));
  }
};

const getUsers = async (req, res) => {
  try {
    const { role, name, email, sortBy = "createdAt", order = "ASC" } = req.query;
    let users;

    if (name) {
      users = await UserServices.getUsersByName(name, sortBy, order);
    } else if (email) {
      users = await UserServices.getUsersByEmail(email, sortBy, order);
    } else {
      users = await UserServices.getAllUsers({ role, sortBy, sortOrder: order });
    }

    return res.status(StatusCodes.OK).json(SuccessResponse(users));
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error));
  }
};

module.exports = { createUser, getUsers };
