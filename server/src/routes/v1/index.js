const express=require("express");
const authRouter=require("./auth-route.js")
const storeRouter=require("./store-route.js")
const ratingRouter=require("./rating-route.js")
const adminRouter=require("./admin-route.js")
const router=express.Router();

router.use("/auth",authRouter);
router.use("/store",storeRouter);
router.use("/rating",ratingRouter);
router.use("/admin",adminRouter)
module.exports=router;