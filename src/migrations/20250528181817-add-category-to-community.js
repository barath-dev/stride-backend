'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('Communities', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Social',
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('Communities', 'category');
  },
};
