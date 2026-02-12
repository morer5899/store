'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.store,{
        foreignKey:"ownerId",
        as:"stores"
      })

      this.hasMany(models.rating,{
        foreignKey:"userId",
        as:"ratings"
      })
    }
  }
  user.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [20, 60],
          msg: 'Name must be between 20 and 60 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Please enter a valid email address"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [0, 400],
          msg: "Address can be a maximum of 400 characters"
        }
      }
    },
    role: {
      type: DataTypes.ENUM('USER', 'STORE_OWNER',"ADMIN"),
      allowNull: false,
      defaultValue: 'USER'
    }
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};