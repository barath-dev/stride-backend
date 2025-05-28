'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Community extends Model {
    static associate(models) {
    }
  }
  Community.init({
    communityId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    communityName: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    communityDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    profileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    followers: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    postIds:{
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Community',
  });
  return Community;
};