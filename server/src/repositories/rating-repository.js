const { rating, user, sequelize } = require("../models");
const crudRepository = require("./crud-repository");

class RatingRepository extends crudRepository {

  constructor(){
    super(rating);
  }

  async addOrUpdateRating({storeId, userId, stars}) {
    const existingRating = await rating.findOne({
      where: { storeId, userId }
    });

    if (existingRating) {
      existingRating.stars = stars;
      await existingRating.save();
      return existingRating;
    }

    return await rating.create({ storeId, userId, stars});
  }


  async getAverageRatingByStore(storeId) {
    const result = await rating.findOne({
      where: { storeId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("stars")), "averageRating"]
      ],
      raw: true
    });

    return Number(result?.averageRating || 0).toFixed(2);
  }

  async getAllRatingsByStore(storeId) {
    return rating.findAll({
      where: { storeId },
      include: [
        {
          model: user,
          attributes: ["id", "name", "email"],
          as:"user"
        }
      ],
      attributes: ["id", "stars", "createdAt"]
    });
  }

  async getUserRatingForStore(storeId, userId) {
  const result = await rating.findOne({
    where: { storeId, userId },
    attributes: ["stars"],
    raw: true
  });

  return result ? result.stars : 0; 
}

async getTotalRatingsByStore(storeId) {
  const result = await rating.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("stars")), "totalStars"]
    ],
    where: { storeId },
    raw: true
  });

  return result?.totalStars || 0;
}

}

module.exports = RatingRepository;
