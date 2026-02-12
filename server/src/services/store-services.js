const { StatusCodes } = require("http-status-codes");
const { StoreRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");

const storeRepository = new StoreRepository();

const getAllStores = async (filters, sortOptions, isAdmin) => {
  try {
    return await storeRepository.getAllStores(filters, sortOptions, isAdmin);
  } catch (error) {
    throw new AppError("cannot get stores", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};



const getStore = async (id) => {
  try {
    const store = await storeRepository.get(id);
    if (!store) {
      throw new AppError(
        "No store found",
        StatusCodes.NOT_FOUND
      );
    }
    return store;
  } catch (error){
    console.log(error)
    throw new AppError("cannot get store", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const destroyStore = async (id) => {
  try {
    return await storeRepository.destroy(id);
  } catch (error){
    throw new AppError("cannot delete store", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const getStoreByName = async (name) => {
  try {
    return await storeRepository.getStoreByName(name);
  } catch(error) {
    throw new AppError("cannot get stores", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const getStoreByAddress = async (address) => {
  try {
    return await storeRepository.getStoreByAddress(address);
  } catch(error) {
    throw new AppError("cannot get stores", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const getStoreByOwner = async (ownerId) => {
  try {
    const store = await storeRepository.getStoreByOwner(ownerId);

    if (!store) {
      throw new AppError("No store found for this owner", StatusCodes.NOT_FOUND);
    }
    return store;
  } catch (error) {
    throw new AppError("cannot get store", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllStores,
  getStore,
  destroyStore,
  getStoreByName,
  getStoreByAddress,
  getStoreByOwner
};