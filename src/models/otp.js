// src/models/otp.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    static associate(models) {
      // OTP belongs to a User
      Otp.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }
  Otp.init(
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: function () {
          // Default expiry of 10 minutes
          return new Date(Date.now() + 10 * 60 * 1000);
        },
      },
    },
    {
      sequelize,
      modelName: 'Otp',
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['otp'],
        },
      ],
    }
  );
  return Otp;
};
