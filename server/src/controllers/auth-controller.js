const { StatusCodes } = require("http-status-codes");
const { AuthServices, UserServices} = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

const signUp=async(req,res)=>{
  try {
    const user=await AuthServices.signUp(req.body);
    return res.status(StatusCodes.CREATED).json(SuccessResponse(user,"signup sucessful"));
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse(error))
  }
}

const signIn=async(req,res)=>{
  try {
    const user=await AuthServices.signIn(req.body);
      return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(user, "Login successful"));
  } catch (error) {
     return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
}

const updatePassword = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const { userId, newPassword } = req.body; 
    if (userId && userId !== loggedInUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own password",
      });
    }
    const user = await AuthServices.updatePassword(loggedInUserId, newPassword);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: user, message: "Password updated successfully" });
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message || "Cannot update password" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // coming from authMiddleware

    const user = await UserServices.getUserProfile(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile fetched successfully",
      data: user
    });
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};


module.exports={signUp,signIn,updatePassword,getProfile};