'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('Activities', 'details', {
      type: Sequelize.JSONB,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('Activities', 'details');
  }
};
