'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    static associate(models) {
      // OTP belongs to User
      Otp.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'userId', // Reference User.userId instead of User.id
        as: 'user',
        onDelete: 'CASCADE',
      });
    }

    // Instance method to check if OTP is expired
    isExpired() {
      if (!this.expiresAt) return false;
      return new Date() > new Date(this.expiresAt);
    }
  }

  Otp.init(
    {
      userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: false,
        validate: {
          isNumeric: true,
          len: [4, 6],
        },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Otp',
      indexes: [
        {
          fields: ['userId', 'otp'],
          name: 'otps_user_code_idx',
        },
        {
          fields: ['expiresAt'],
          name: 'otps_expires_idx',
        },
      ],
      defaultScope: {
        where: { isUsed: false },
      },
      scopes: {
        withUsed: {
          where: {},
        },
        notExpired: {
          where: {
            expiresAt: {
              [Op.gt]: new Date(),
            },
            isUsed: false,
          },
        },
      },
    }
  );

  return Otp;
};
