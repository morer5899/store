const { Op } = require("sequelize");
const { store, user, rating, sequelize } = require("../models");
const crudRepository = require("./crud-repository");

class StoreRepository extends crudRepository {
  constructor() {
    super(store);
  }

  getSortClause(sortBy, order) {

    const validOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    switch (sortBy) {

      case "storeName":
        return [["storeName", validOrder]];

      case "address":
        return [["address", validOrder]];

      case "createdAt":
        return [["createdAt", validOrder]];

      case "ratings":
        return [
          [sequelize.literal("averageRating"), validOrder]
        ];

      default:
        return [["createdAt", "ASC"]];
    }
  }

  async getAllStores(filters, sortOptions, isAdmin = false) {

  const { name, address } = filters;
  const { sortBy = "createdAt", order = "ASC" } = sortOptions;

  const where = {};

  if (name) {
    where.storeName = {
      [Op.like]: `%${name}%`
    };
  }

  if (address) {
    where.address = {
      [Op.like]: `%${address}%`
    };
  }

  const includeOptions = [
    {
      model: rating,
      as: "ratings",
      attributes: []
    }
  ];

  // 👇 Only include owner if ADMIN
  if (isAdmin) {
    includeOptions.push({
      model: user,
      as: "owner",
      attributes: ["id", "name", "email"]
    });
  }

  const attributes = [
    "id",
    "storeName",
    "address",
    "createdAt",
    [
      sequelize.fn(
        "ROUND",
        sequelize.fn("AVG", sequelize.col("ratings.stars")),
        2
      ),
      "averageRating"
    ]
  ];

  const group = ["store.id"];

  
  if (isAdmin) {
    group.push("owner.id");
  }

  const res = await this.model.findAll({
    where,
    include: includeOptions,
    attributes,
    group,
    order: this.getSortClause(sortBy, order)
  });

  return res;
}





  async getStoreByName(search) {
    const res = await this.model.findAll({
      where: {
        [Op.or]: [
          {
            storeName: {
              [Op.like]: `${search}%`
            }
          }
        ]
      }
    })
    return res;
  }

  async getStoreByAddress(search) {
    const res = await this.model.findAll({
      where: {
        address: {
          [Op.like]: `${search}%`
        }
      }
    })
    return res;
  }

  async getStoreByOwner(ownerId) {
  return this.model.findOne({
    where: { ownerId }
  });
}

}

module.exports = StoreRepository;