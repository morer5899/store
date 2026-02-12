const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StoreServices } = require("../services");
const AppError = require("../utils/error/app-error");

const getStores = async (req, res) => {
  try {
    const { name, address, sortBy, order } = req.query;

    const filters = { name, address };
    const sortOptions = { sortBy, order };

    const isAdmin = req.user.role === "ADMIN";

    const stores = await StoreServices.getAllStores(
      filters,
      sortOptions,
      isAdmin
    );

    if (!stores || stores.length === 0) {
      throw new AppError("No stores found", StatusCodes.NOT_FOUND);
    }

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(stores));

  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
};



const getStore = async (req, res) => {
  try {
    const store = await StoreServices.getStore(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(store));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
};

const destroyStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    const store = await StoreServices.getStore(id);

    if (!store) {
      throw new AppError("Store not found", StatusCodes.NOT_FOUND);
    }
    if (role === "STORE_OWNER" && store.ownerId !== userId) {
      throw new AppError(
        "You are not allowed to delete this store",
        StatusCodes.FORBIDDEN
      );
    }
    await StoreServices.destroyStore(id);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(null, "Store deleted successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
};


const getMyStore = async (req, res) => {
  try {
    const store = await StoreServices.getStoreByOwner(req.user.id);

    return res.status(StatusCodes.OK).json(
      SuccessResponse(store)
    );
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
};


module.exports = { getStores, getStore, destroyStore,getMyStore };