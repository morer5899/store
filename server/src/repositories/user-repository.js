const { user } = require("../models");
const crudRepository = require("./crud-repository");
const { Op } = require("sequelize");

class UserRepository extends crudRepository {
  constructor() {
    super(user);
  }

  async getAllUsers({ role, name, email, sortBy = "createdAt", sortOrder = "ASC" }) {
    const where = {};
    if (role) where.role = role;
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };

    return this.model.findAll({
      where,
      attributes: { exclude: ["password"] },
      order: [[sortBy, sortOrder.toUpperCase()]]
    });
  }

  async getUserByName(name, sortBy = "createdAt", sortOrder = "ASC") {
    return this.model.findAll({
      where: { name: { [Op.like]: `%${name}%` } },
      attributes: { exclude: ["password"] },
      order: [[sortBy, sortOrder.toUpperCase()]]
    });
  }
  async getUserById(id) {
    return this.model.findByPk(id, {
      attributes: { exclude: ["password"] }
    });
  }

  async getUserByEmail(email, sortBy = "createdAt", sortOrder = "ASC") {
    return this.model.findAll({
      where: { email: { [Op.like]: `%${email}%` } },
      attributes: { exclude: ["password"] },
      order: [[sortBy, sortOrder.toUpperCase()]]
    });
  }
}

module.exports = UserRepository;
