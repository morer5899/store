const express=require("express");
const { AdminController } = require("../../controllers");
const { adminMiddleware, authMiddleware, signupMiddleware } = require("../../middlewares");



const router=express.Router();
router.post("/create-user", authMiddleware,adminMiddleware,signupMiddleware, AdminController.createUser);
router.get("/users", authMiddleware,adminMiddleware, AdminController.getUsers);
module.exports=router;