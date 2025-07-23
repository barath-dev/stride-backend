'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Step 1: Inspect the users table structure
      console.log('Inspecting users table structure...');
      const usersColumns = await queryInterface.sequelize.query(
        `SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = 'users';`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      console.log(
        'Users table columns:',
        usersColumns.map(c => c.column_name)
      );

      // Step 2: Inspect the communities table structure
      console.log('Inspecting communities table structure...');
      const communitiesColumns = await queryInterface.sequelize.query(
        `SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = 'communities';`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      console.log(
        'Communities table columns:',
        communitiesColumns.map(c => c.column_name)
      );

      // Step 3: Determine the correct column names for foreign keys
      // Look for user ID and community ID columns
      const userIdColumn = usersColumns.find(
        c =>
          c.column_name.toLowerCase().includes('userid') ||
          c.column_name.toLowerCase() === 'id'
      )?.column_name;

      const communityIdColumn = communitiesColumns.find(
        c =>
          c.column_name.toLowerCase().includes('communityid') ||
          c.column_name.toLowerCase() === 'id'
      )?.column_name;

      console.log('User ID column found:', userIdColumn);
      console.log('Community ID column found:', communityIdColumn);

      if (!userIdColumn || !communityIdColumn) {
        throw new Error(
          'Could not find ID columns in users or communities tables'
        );
      }

      // Step 4: Create the UserCommunity junction table
      console.log(
        `Creating UserCommunity table with references to users(${userIdColumn}) and communities(${communityIdColumn})...`
      );

      // First create ENUM type if it doesn't exist
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_usercommunity_role') THEN
            CREATE TYPE "enum_UserCommunity_role" AS ENUM ('member', 'admin', 'moderator');
          END IF;
        END
        $$;
      `);

      // Create table without foreign keys first
      await queryInterface.createTable('UserCommunity', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        communityId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM('member', 'admin', 'moderator'),
          defaultValue: 'member',
          allowNull: false,
        },
        joinedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
      });

      // Then add foreign key constraints separately
      await queryInterface.addConstraint('UserCommunity', {
        fields: ['userId'],
        type: 'foreign key',
        name: 'fk_usercommunity_user',
        references: {
          table: 'users',
          field: userIdColumn,
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      await queryInterface.addConstraint('UserCommunity', {
        fields: ['communityId'],
        type: 'foreign key',
        name: 'fk_usercommunity_community',
        references: {
          table: 'communities',
          field: communityIdColumn,
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Add unique constraint
      await queryInterface.addConstraint('UserCommunity', {
        fields: ['userId', 'communityId'],
        type: 'unique',
        name: 'unique_user_community',
      });

      // Add indexes
      await queryInterface.addIndex('UserCommunity', ['userId'], {
        name: 'user_community_user_id_idx',
      });

      await queryInterface.addIndex('UserCommunity', ['communityId'], {
        name: 'user_community_community_id_idx',
      });

      console.log('UserCommunity junction table created successfully!');

      // Similarly for PostLike table...
      // Steps for PostLike table would follow the same pattern

      return Promise.resolve();
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable('UserCommunity');
      console.log('UserCommunity table dropped successfully');

      // Drop enum type if it exists
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_UserCommunity_role";
      `);

      return Promise.resolve();
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  },
};
