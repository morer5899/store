const express=require("express");
const { signupMiddleware, authMiddleware } = require("../../middlewares");
const { AuthController } = require("../../controllers");


const router=express.Router();

router.post("/signup",signupMiddleware,AuthController.signUp);
router.post("/login",AuthController.signIn);
router.patch("/update-password",authMiddleware,AuthController.updatePassword)
router.get("/profile", authMiddleware, AuthController.getProfile);
module.exports=router;