'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add activityId column
    await queryInterface.addColumn('Activities', 'activityId', {
      type: Sequelize.STRING,
      allowNull: true, // Initially allow null for existing records
      unique: true,
    });

    // Generate UUIDs for existing activities
    await queryInterface.sequelize.query(`
      UPDATE "Activities" 
      SET "activityId" = (
        SELECT md5(random()::text || clock_timestamp()::text)::uuid::text
      )
      WHERE "activityId" IS NULL;
    `);

    // Now make the column not nullable
    await queryInterface.changeColumn('Activities', 'activityId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    // Add index for activityId
    await queryInterface.addIndex('Activities', ['activityId'], {
      name: 'activity_id_idx',
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Activities', 'activity_id_idx');
    await queryInterface.removeColumn('Activities', 'activityId');
  },
};
