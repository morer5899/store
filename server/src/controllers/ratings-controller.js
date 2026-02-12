const { StatusCodes } = require("http-status-codes");
const { RatingServices } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { rating } = require("../models");
const addOrUpdateRating=async(req,res)=>{
  try {
    const users=await RatingServices.addOrUpdateRating({
      storeId:req.params.storeId,
      userId:req.user.id,
      stars:parseInt(req.body.stars)
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(users));
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error))
  }
}

const getAverageRatings=async(req,res)=>{
  try {
    const avg=await RatingServices.getAverageRatings(req.params.storeId);
    return res.status(StatusCodes.OK).json(SuccessResponse(avg));
  } catch (error) {
    // console.log(error)
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error))
  }
}

const getAllUsersRating=async(req,res)=>{
  try {
    const users=await RatingServices.getAllUsersRatings(req.params.storeId);
    return res.status(StatusCodes.OK).json(SuccessResponse(users));
  } catch (error) {
    // console.log(error)
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error))
  }
}
const getUserRatingForStore = async (req, res) => {
  try {
    const rating = await RatingServices.getUserRatingForStore(
      req.params.storeId,
      req.user.id
    );

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        storeId: req.params.storeId,
        userId: req.user.id,
        rating: rating
      })
    );
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
};

const getTotalRatings = async (req, res) => {
  try {
    const total = await RatingServices.getTotalRatings(req.params.storeId);

    return res.status(StatusCodes.OK).json(
      SuccessResponse(total)
    );
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
};

const getTotalStarsSum = async (req, res) => {
  try {
    const totalStars = await rating.sum("stars");

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Total stars sum fetched successfully",
      data: {
        totalStars: totalStars || 0
      }
    });

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch total stars sum"
    });
  }
};

module.exports={getAllUsersRating,addOrUpdateRating,getAverageRatings,getUserRatingForStore,getTotalRatings,getTotalStarsSum}