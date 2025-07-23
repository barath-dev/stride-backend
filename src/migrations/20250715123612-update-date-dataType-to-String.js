'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //update all the tables with date dataType to String
    await queryInterface.sequelize.query(
      'ALTER TABLE "otps" ALTER COLUMN "expiresAt" TYPE VARCHAR;'
    );
  },

  async down(queryInterface, Sequelize) {
    //revert back to date dataType
    await queryInterface.sequelize.query(
      'ALTER TABLE "otps" ALTER COLUMN "expiresAt" TYPE DATE;'
    );
  },
};
