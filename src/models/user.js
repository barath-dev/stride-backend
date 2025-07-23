// src/models/user.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many OTPs
      User.hasMany(models.Otp, {
        foreignKey: 'userId',
        sourceKey: 'userId',
        as: 'otps',
        onDelete: 'CASCADE',
      });

      // User has many Activities
      User.hasMany(models.Activity, {
        foreignKey: 'userId',
        sourceKey: 'userId',
        as: 'activities',
        onDelete: 'CASCADE',
      });

      // User has many Posts
      User.hasMany(models.Post, {
        foreignKey: 'userId',
        sourceKey: 'userId',
        as: 'posts',
        onDelete: 'CASCADE',
      });

      // User belongs to many Communities (through UserCommunity)
      User.belongsToMany(models.Community, {
        through: 'UserCommunity',
        foreignKey: 'userId',
        otherKey: 'communityId',
        as: 'communities',
      });
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          unique: true,
          fields: ['userId'],
        },
      ],
    }
  );
  return User;
};
