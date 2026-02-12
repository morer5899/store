const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/error/app-error");
const { ErrorResponse } = require("../utils/common");

const storeMiddleware=async(req,res,next)=>{
  try {
    if(req.user.role==="USER"){
      throw new AppError(["you don't have permission to destroy the store"],StatusCodes.BAD_REQUEST)
    }
    next();
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error));
  }
}

module.exports=storeMiddleware;