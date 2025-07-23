'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Otps', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Set expiration for existing OTPs to 10 minutes from now
    await queryInterface.sequelize.query(`
      UPDATE "Otps"
      SET "expiresAt" = NOW() + INTERVAL '10 minutes'
      WHERE "expiresAt" IS NULL;
    `);

    // Make the column not nullable
    await queryInterface.changeColumn('Otps', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    // Add index for easy querying of expired OTPs
    await queryInterface.addIndex('Otps', ['expiresAt'], {
      name: 'otp_expires_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Otps', 'otp_expires_at_idx');
    await queryInterface.removeColumn('Otps', 'expiresAt');
  },
};
