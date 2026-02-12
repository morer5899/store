const jwt =require("jsonwebtoken");
const {StatusCodes}=require("http-status-codes");
const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/error/app-error");
const authMiddleware=async(req,res,next)=>{
   try {
     const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
      const message="Authentication failed";
      const error=new AppError(["Authentication token missing"],StatusCodes.UNAUTHORIZED)
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse(message,error))
    }

    const token=authHeader.split(" ")[1];
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
   } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(error,"Authentication failed")
   }
  
}

module.exports=authMiddleware;