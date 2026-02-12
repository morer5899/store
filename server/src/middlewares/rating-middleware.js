const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/error/app-error");
const { ErrorResponse } = require("../utils/common");

const ratingMiddleware=async(req,res,next)=>{
  try {
    if(req.user.role==="STORE_OWNER"){
      throw new AppError(["you don't have permission to edit ratings"],StatusCodes.BAD_REQUEST)
    }
    next();
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error));
  }
}

module.exports=ratingMiddleware;