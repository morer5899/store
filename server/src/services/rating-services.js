const { StatusCodes } = require("http-status-codes");
const {RatingRepository} = require("../repositories");
const AppError = require("../utils/error/app-error");

const ratingRepository=new RatingRepository();

const getAverageRatings=async(storeId)=>{
  try {
    const avg = await ratingRepository.getAverageRatingByStore(storeId);
    return avg;
  } catch (error) {
    throw new AppError("cannot get ratings", StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

const getAllUsersRatings=async(storeId)=>{
  try {
    const users = await ratingRepository.getAllRatingsByStore(storeId);
    return users;
  } catch (error) {
    throw new AppError("cannot get ratings", StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

const addOrUpdateRating=async({storeId,userId,stars})=>{
  try {

    const rating=await ratingRepository.addOrUpdateRating({stars,storeId,userId});
    return rating;
  } catch (error) {
      throw new AppError("cannot add or update ratings", StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

const getUserRatingForStore = async (storeId, userId) => {
  try {
    const rating = await ratingRepository.getUserRatingForStore(storeId, userId);
    return rating;
  } catch (error) {
    throw new AppError("Cannot fetch user rating", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
const getTotalRatings = async (storeId) => {
  try {
    const total = await ratingRepository.getTotalRatingsByStore(storeId);
    return total;
  } catch (error) {
    throw new AppError("Cannot fetch total ratings", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};


module.exports={getAverageRatings,getAllUsersRatings,addOrUpdateRating,getUserRatingForStore,getTotalRatings};