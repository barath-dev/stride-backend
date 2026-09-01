'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if table exists
      const tableExists = await queryInterface.tableExists('Posts');
      if (!tableExists) {
        throw new Error(
          'Posts table does not exist. Please create the base table first.'
        );
      }

      // Get current table description to check existing columns
      const tableDescription = await queryInterface.describeTable('Posts');

      // Add communityId column if it doesn't exist
      if (!tableDescription.communityId) {
        await queryInterface.addColumn(
          'Posts',
          'communityId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Communities',
              key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
          { transaction }
        );
      }

      // Add likedBy column if it doesn't exist
      if (!tableDescription.likedBy) {
        await queryInterface.addColumn(
          'Posts',
          'likedBy',
          {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: '[]', // NOTE: Use string representation for default JSON
          },
          { transaction }
        );
      }

      // Add postId column if it doesn't exist
      if (!tableDescription.postId) {
        await queryInterface.addColumn(
          'Posts',
          'postId',
          {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
          },
          { transaction }
        );

        // For existing records, generate UUIDs
        // NOTE: This requires the uuid-ossp extension in PostgreSQL
        await queryInterface.sequelize.query(
          `
          UPDATE "Posts" 
          SET "postId" = gen_random_uuid()::text 
          WHERE "postId" IS NULL;
        `,
          { transaction }
        );
      }

      // Add likeCount column if it doesn't exist
      if (!tableDescription.likeCount) {
        await queryInterface.addColumn(
          'Posts',
          'likeCount',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          { transaction }
        );
      }

      // Add category column if it doesn't exist
      if (!tableDescription.category) {
        await queryInterface.addColumn(
          'Posts',
          'category',
          {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'Other', // NOTE: Temporary default for existing records
          },
          { transaction }
        );

        // NOTE: Sequelize migrations don't support validate constraints directly
        // Add check constraint manually for category validation
        await queryInterface.sequelize.query(
          `
          ALTER TABLE "Posts" 
          ADD CONSTRAINT "Posts_category_check" 
          CHECK ("category" IN (
            'Running', 'Cycling', 'Yoga', 'Hiking', 'Fitness',
            'Swimming', 'Basketball', 'Tennis', 'Soccer', 'Other'
          ));
        `,
          { transaction }
        );
      }

      // Add stats column if it doesn't exist (assuming this might be missing too)
      if (!tableDescription.stats) {
        await queryInterface.addColumn(
          'Posts',
          'stats',
          {
            type: Sequelize.JSONB,
            allowNull: true,
          },
          { transaction }
        );
      }

      // Add indexes for better performance
      try {
        await queryInterface.addIndex('Posts', ['userId'], {
          name: 'posts_user_id_index',
          transaction,
        });
      } catch (error) {
        console.log(
          'Index posts_user_id_index already exists or error:',
          error.message
        );
      }

      try {
        await queryInterface.addIndex('Posts', ['communityId'], {
          name: 'posts_community_id_index',
          transaction,
        });
      } catch (error) {
        console.log(
          'Index posts_community_id_index already exists or error:',
          error.message
        );
      }

      try {
        await queryInterface.addIndex('Posts', ['postId'], {
          name: 'posts_post_id_index',
          unique: true,
          transaction,
        });
      } catch (error) {
        console.log(
          'Index posts_post_id_index already exists or error:',
          error.message
        );
      }

      try {
        await queryInterface.addIndex('Posts', ['category'], {
          name: 'posts_category_index',
          transaction,
        });
      } catch (error) {
        console.log(
          'Index posts_category_index already exists or error:',
          error.message
        );
      }

      await transaction.commit();
      console.log('Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove check constraint first
      await queryInterface.sequelize.query(
        `
        ALTER TABLE "Posts" DROP CONSTRAINT IF EXISTS "Posts_category_check";
      `,
        { transaction }
      );

      // Remove indexes
      await queryInterface.removeIndex('Posts', 'posts_user_id_index', {
        transaction,
      });
      await queryInterface.removeIndex('Posts', 'posts_community_id_index', {
        transaction,
      });
      await queryInterface.removeIndex('Posts', 'posts_post_id_index', {
        transaction,
      });
      await queryInterface.removeIndex('Posts', 'posts_category_index', {
        transaction,
      });

      // Remove columns
      await queryInterface.removeColumn('Posts', 'communityId', {
        transaction,
      });
      await queryInterface.removeColumn('Posts', 'likedBy', { transaction });
      await queryInterface.removeColumn('Posts', 'postId', { transaction });
      await queryInterface.removeColumn('Posts', 'likeCount', { transaction });
      await queryInterface.removeColumn('Posts', 'category', { transaction });
      await queryInterface.removeColumn('Posts', 'stats', { transaction });

      await transaction.commit();
      console.log('Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Rollback failed:', error);
      throw error;
    }
  },
};
