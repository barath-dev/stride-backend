'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // Post belongs to User
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'userId', // Reference User.userId instead of User.id
        as: 'author',
        onDelete: 'CASCADE',
      });

      // Post belongs to Community (optional)
      Post.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community',
        onDelete: 'SET NULL',
      });
    }

    // Instance methods
    getLikeCount() {
      return Array.isArray(this.likedBy) ? this.likedBy.length : 0;
    }

    isLikedBy(userId) {
      return Array.isArray(this.likedBy) && this.likedBy.includes(userId);
    }

    async addLike(userId) {
      if (!this.isLikedBy(userId)) {
        const updatedLikes = [...(this.likedBy || []), userId];
        await this.update({
          likedBy: updatedLikes,
          likeCount: updatedLikes.length,
        });
        return true;
      }
      return false;
    }

    async removeLike(userId) {
      if (this.isLikedBy(userId)) {
        const updatedLikes = (this.likedBy || []).filter(id => id !== userId);
        await this.update({
          likedBy: updatedLikes,
          likeCount: updatedLikes.length,
        });
        return true;
      }
      return false;
    }
  }

  Post.init(
    {
      postId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        unique: true,
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 2000],
        },
      },
      userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      category: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Other',
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
      likedBy: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false,
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('LikedBy must be an array');
            }
          },
        },
      },
      communityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Post',
      defaultScope: {
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
      },
      scopes: {
        withInactive: {
          where: {},
        },
        byCategory: category => ({
          where: { category, isActive: true },
        }),
        popular: {
          where: { isActive: true },
          order: [
            ['likeCount', 'DESC'],
            ['createdAt', 'DESC'],
          ],
        },
        recent: {
          where: { isActive: true },
          order: [['createdAt', 'DESC']],
        },
      },
      hooks: {
        beforeUpdate: post => {
          // Sync likeCount with likedBy array length
          if (post.likedBy) {
            post.likeCount = Array.isArray(post.likedBy)
              ? post.likedBy.length
              : 0;
          }
        },
      },
    }
  );

  return Post;
};
