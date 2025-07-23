// models/comment.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // Comment belongs to post
      Comment.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post',
      });

      // Comment belongs to user
      Comment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'author',
      });
    }
  }

  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000],
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      indexes: [
        {
          fields: ['postId'],
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );

  return Comment;
};
