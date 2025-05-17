'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Otp.belongsTo(models.User, {
      //   foreignKey: 'userId',
      //   as: 'user',
      //   onDelete: 'CASCADE',
      // });
    }
  }
  Otp.init({
    userId: DataTypes.STRING,
    otp: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Otp',
  });
  return Otp;
};