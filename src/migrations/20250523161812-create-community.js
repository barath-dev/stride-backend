'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Communities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      communityId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      communityName: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      communityDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      profileUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      followers: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      postIds: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Communities');
  },
};
