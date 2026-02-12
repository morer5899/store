'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      store.belongsTo(models.user,{
        foreignKey:"ownerId",
        as:"owner"
      })

      store.hasMany(models.rating,{
        foreignKey:"storeId",
        as:"ratings"
      })
    }
  }
  store.init({
    storeName: {
      type:DataTypes.STRING
    },
    email: {
      type:DataTypes.STRING,
      allowNull:false
    },
    address: {
      type:DataTypes.STRING,
      allowNull:false
    },
    ownerId: {
      type:DataTypes.INTEGER,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'store',
  });
  return store;
};