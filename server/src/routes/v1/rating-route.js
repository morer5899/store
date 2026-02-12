const express = require("express");
const { RatingController } = require("../../controllers");
const { authMiddleware, ratingMiddleware, adminMiddleware } = require("../../middlewares");

const router = express.Router();

router.post("/:storeId", authMiddleware, ratingMiddleware, RatingController.addOrUpdateRating
);
router.get(
  "/:storeId/user",
  authMiddleware,
  RatingController.getUserRatingForStore
);
router.get("/:storeId/avg", RatingController.getAverageRatings);
router.get(
  "/:storeId/total",
  RatingController.getTotalRatings
);
router.get(
  "/count",
  authMiddleware,
  adminMiddleware,
  RatingController.getTotalStarsSum
);
router.get("/:storeId", authMiddleware, RatingController.getAllUsersRating
);


module.exports = router;
