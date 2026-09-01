'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Community extends Model {
    static associate(models) {
      // Community has many posts
      Community.hasMany(models.Post, {
        foreignKey: 'communityId',
        as: 'posts',
        onDelete: 'SET NULL',
      });
    }

    // Instance methods
    getMemberCount() {
      return Array.isArray(this.followers) ? this.followers.length : 0;
    }

    isMember(userId) {
      return Array.isArray(this.followers) && this.followers.includes(userId);
    }

    async addMember(userId) {
      if (!this.isMember(userId)) {
        const updatedFollowers = [...(this.followers || []), userId];
        await this.update({ followers: updatedFollowers });
        return true;
      }
      return false;
    }

    async removeMember(userId) {
      if (this.isMember(userId)) {
        const updatedFollowers = (this.followers || []).filter(
          id => id !== userId
        );
        await this.update({ followers: updatedFollowers });
        return true;
      }
      return false;
    }
  }

  Community.init(
    {
      communityId: {
        type: DataTypes.STRING(36),
        unique: true,
        allowNull: false,
      },
      communityName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 100],
        },
      },
      communityDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 1000],
        },
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
      profileUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      followers: {
        type: DataTypes.JSONB,
        defaultValue: [],
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('Followers must be an array');
            }
          },
        },
      },
      postIds: {
        type: DataTypes.JSONB,
        defaultValue: [],
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('PostIds must be an array');
            }
          },
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
      modelName: 'Community',
      defaultScope: {
        where: { isActive: true },
      },
      scopes: {
        withInactive: {
          where: {},
        },
        byCategory: category => ({
          where: { category, isActive: true },
        }),
      },
    }
  );

  return Community;
};
