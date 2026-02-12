const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/error/app-error");
const { UserRepository } = require("../repositories");

const userRepository = new UserRepository();

const getAllUsers = async ({ role, sortBy, sortOrder }) => {
  try {
    return await userRepository.getAllUsers({ role, sortBy, sortOrder });
  } catch {
    throw new AppError("Cannot get all users", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const getUsersByName = async (name, sortBy, sortOrder) => {
  try {
    return await userRepository.getUserByName(name, sortBy, sortOrder);
  } catch {
    throw new AppError("Cannot get users by name", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const getUsersByEmail = async (email, sortBy, sortOrder) => {
  try {
    return await userRepository.getUserByEmail(email, sortBy, sortOrder);
  } catch {
    throw new AppError("Cannot get users by email", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
const getUserProfile = async (userId) => {
  try {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    return user;
  } catch (error) {
    throw new AppError(
      error.message || "Cannot fetch user profile",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = { getAllUsers, getUsersByName, getUsersByEmail,getUserProfile };
