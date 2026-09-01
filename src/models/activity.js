'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      // Activity belongs to User
      Activity.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'userId', // Reference User.userId instead of User.id
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }

  Activity.init(
    {
      userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [
            [
              'Running',
              'Cycling',
              'Yoga',
              'Hiking',
              'Fitness',
              'Swimming',
              'Basketball',
              'Tennis',
              'Soccer',
              'Other',
            ],
          ],
        },
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notEmpty: true,
          isValidDetails(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Details must be a valid JSON object');
            }
          },
        },
      },
      duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      distance: {
        type: DataTypes.FLOAT, // Distance in kilometers
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      calories: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: 'Activity',
      defaultScope: {
        order: [['createdAt', 'DESC']],
      },
      scopes: {
        byCategory: category => ({
          where: { category },
        }),
        recent: (days = 30) => ({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            },
          },
        }),
      },
    }
  );

  return Activity;
};
