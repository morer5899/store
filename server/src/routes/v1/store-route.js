const express=require("express");
const { StoreController } = require("../../controllers");
const { authMiddleware, storeMiddleware } = require("../../middlewares");


const router=express.Router();

router.get("/",authMiddleware, StoreController.getStores);
router.get("/my-store", authMiddleware, storeMiddleware,StoreController.getMyStore);
router.get("/:id", StoreController.getStore);
router.delete("/:id",authMiddleware,storeMiddleware,StoreController.destroyStore);


module.exports = router;