'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many posts
      User.hasMany(models.Post, {
        foreignKey: 'userId',
        sourceKey: 'userId', // Use userId instead of id
        as: 'posts',
        onDelete: 'CASCADE',
      });

      // User has many activities
      User.hasMany(models.Activity, {
        foreignKey: 'userId',
        sourceKey: 'userId', // Use userId instead of id
        as: 'activities',
        onDelete: 'CASCADE',
      });

      // User has many OTPs (for verification)
      User.hasMany(models.Otp, {
        foreignKey: 'userId',
        sourceKey: 'userId', // Use userId instead of id
        as: 'otps',
        onDelete: 'CASCADE',
      });
    }

    // Instance methods
    toSafeJSON() {
      const user = this.toJSON();
      delete user.password;
      delete user.deletedAt;
      return user;
    }
  }

  User.init(
    {
      userId: {
        type: DataTypes.STRING(36),
        unique: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 255],
        },
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      profileImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      indexes: [
        {
          fields: ['userId'],
          unique: true,
          name: 'users_userid_unique_idx',
        },
        {
          fields: ['email'],
          unique: true,
          name: 'users_email_unique_idx',
        },
        {
          fields: ['isVerified'],
          name: 'users_verified_idx',
        },
      ],
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
        verified: {
          where: { isVerified: true },
        },
      },
    }
  );

  return User;
};
