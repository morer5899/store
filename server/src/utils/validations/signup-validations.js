const AppError = require("../error/app-error");
const { StatusCodes } = require("http-status-codes");

const isRequired = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      throw new AppError(
        [`${key} is required`],
        StatusCodes.BAD_REQUEST
      );
    }
  }
};

const validateName = (name) => {
  if (name.length < 20 || name.length > 60) {
    throw new AppError(
      ["Name must be between 20 and 60 characters"],
      StatusCodes.BAD_REQUEST
    );
  }
};

const validateStoreName = (storeName) => {
  if(!storeName){
     throw new AppError(
        [`StoreName is required`],
        StatusCodes.BAD_REQUEST
      );
  }
};

const validateAddress = (address) => {
  if (address.length > 400) {
    throw new AppError(
      ["Address can be a maximum of 400 characters"],
      StatusCodes.BAD_REQUEST
    );
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(
      ["Invalid email format"],
      StatusCodes.BAD_REQUEST
    );
  }
};

const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  if (!passwordRegex.test(password)) {
    throw new AppError(
      ["Password must be 8-16 chars, include one uppercase and one special character"],
      StatusCodes.BAD_REQUEST
    );
  }
};

const validateRole = (role) => {
  const allowedRoles = ["USER", "STORE_OWNER", "ADMIN"];
  if (!allowedRoles.includes(role)) {
    throw new AppError(
      ["Invalid role"],
      StatusCodes.BAD_REQUEST
    );
  }
};

const validateSignup = (data) => {
  isRequired({
    name: data.name,
    email: data.email,
    password: data.password,
    address: data.address,
    role: data.role
  });
  if(data.role==="STORE_OWNER"){
    validateStoreName(data.storeName);
  }
  validateName(data.name);
  validateEmail(data.email);
  validatePassword(data.password);
  validateAddress(data.address);
  validateRole(data.role);
};

module.exports = {
  validateSignup,
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRole,
  isRequired
};
