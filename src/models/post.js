// src/models/post.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // Post belongs to a Community
      Post.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community',
      });

      // Post belongs to a User
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'userId',
        as: 'author',
      });

      // Post likes will be handled through PostLike model instead of JSON array
      Post.belongsToMany(models.User, {
        through: 'PostLike',
        foreignKey: 'postId',
        otherKey: 'userId',
        as: 'likedByUsers',
      });
    }
  }

  Post.init(
    {
      caption: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
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
      stats: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      // This will be replaced by the PostLike association table
      likedBy: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false,
      },
      postId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      communityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Communities',
          key: 'id',
        },
      },
      likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          isInt: true,
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: 'Post',
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['communityId'],
        },
        {
          unique: true,
          fields: ['postId'],
        },
        {
          fields: ['category'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );

  return Post;
};
