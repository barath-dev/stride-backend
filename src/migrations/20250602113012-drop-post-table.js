'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //drop post table
    await queryInterface.dropTable('Posts');
  },

  async down(queryInterface, Sequelize) {},
};
