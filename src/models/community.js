// src/models/community.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Community extends Model {
    static associate(models) {
      // Community has many Posts
      Community.hasMany(models.Post, {
        foreignKey: 'communityId',
        as: 'posts',
      });

      // Community belongs to many Users (through UserCommunity)
      Community.belongsToMany(models.User, {
        through: 'UserCommunity',
        foreignKey: 'communityId',
        otherKey: 'userId',
        as: 'members',
      });
    }
  }
  Community.init(
    {
      communityId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      communityName: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
        },
      },
      communityDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 500],
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
      profileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // These will be replaced by the UserCommunity association table
      followers: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false,
      },
      postIds: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Community',
      indexes: [
        {
          unique: true,
          fields: ['communityId'],
        },
        {
          unique: true,
          fields: ['communityName'],
        },
        {
          fields: ['category'],
        },
      ],
    }
  );
  return Community;
};
