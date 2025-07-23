// src/models/activity.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      // Activity belongs to a User
      Activity.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }
  Activity.init(
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
      },
      category: {
        type: DataTypes.STRING,
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
        defaultValue: {},
      },
      activityId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Activity',
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['category'],
        },
        {
          unique: true,
          fields: ['activityId'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
  return Activity;
};
