const { StatusCodes } = require("http-status-codes");
const { AuthRepository ,StoreRepository} = require("../repositories");
const AppError = require("../utils/error/app-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validate } = require("../utils/validations");

const authRepository = new AuthRepository();
const storeRepository=new StoreRepository();
const signUp = async (data) => {
  try {
    let user = await authRepository.findByEmail(data.email);
    if (user) {
      throw new AppError("user allready exist please login", StatusCodes.BAD_REQUEST);
    }
    let hashedPassword = await bcrypt.hash(data.password, 10);
     const normalizedUserData = {
      ...data,
      name: data.name.toLowerCase(),
      email: data.email.toLowerCase(),
      address: data.address.toLowerCase(),
      password: hashedPassword
    };
    user = await authRepository.create(normalizedUserData);
    if (data.role === "STORE_OWNER") {
      const defaultStore = {
        storeName: data.storeName.toLocaleLowerCase(),
        email: data.email,
        address: data.address.toLocaleLowerCase(),
        ownerId: user.id
      };
      await storeRepository.create(defaultStore);
    }
    user.password = undefined;
    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("cannot signup", StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

const signIn = async (data) => {
  try {
    if (!data.email || !data.password) {
      throw new AppError("all fields are required");
    }

    let user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("User is not present", StatusCodes.UNAUTHORIZED);
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" })
    user.password = undefined;

    return { user, token };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("cannot signup", StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

const updatePassword = async (userId, newPassword) => {
  try {
    validate.validatePassword(newPassword);

    const user = await authRepository.get(userId);

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    user.password = undefined;

    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("cannot update password", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = { signUp, signIn, updatePassword };