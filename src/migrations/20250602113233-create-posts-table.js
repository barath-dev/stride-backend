'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create the Posts table
      await queryInterface.createTable(
        'Posts',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          caption: {
            type: Sequelize.STRING,
            allowNull: true, // NOTE: Based on your model, caption can be null
          },
          userId: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          imageUrl: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
          },
          category: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          stats: {
            type: Sequelize.JSONB,
            allowNull: true,
          },
          likedBy: {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: '[]', // NOTE: Use string representation for JSON default
          },
          postId: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
          },
          communityId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Communities',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          likeCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        {
          transaction,
          // Add table-level options
          charset: 'utf8mb4', // For MySQL (ignored by PostgreSQL)
          collate: 'utf8mb4_unicode_ci', // For MySQL (ignored by PostgreSQL)
        }
      );

      // NOTE: This ensures data integrity at database level
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

      // Add check constraint for likeCount validation
      await queryInterface.sequelize.query(
        `
        ALTER TABLE "Posts" 
        ADD CONSTRAINT "Posts_likeCount_check" 
        CHECK ("likeCount" >= 0);
      `,
        { transaction }
      );

      // Create indexes for better performance
      // Index on userId (posts by user)
      await queryInterface.addIndex('Posts', ['userId'], {
        name: 'posts_user_id_index',
        transaction,
      });

      // Index on communityId (posts by community)
      await queryInterface.addIndex('Posts', ['communityId'], {
        name: 'posts_community_id_index',
        transaction,
      });

      // Unique index on postId
      await queryInterface.addIndex('Posts', ['postId'], {
        name: 'posts_post_id_unique_index',
        unique: true,
        transaction,
      });

      // Index on category (filtering by category)
      await queryInterface.addIndex('Posts', ['category'], {
        name: 'posts_category_index',
        transaction,
      });

      // Index on createdAt (sorting by date)
      await queryInterface.addIndex('Posts', ['createdAt'], {
        name: 'posts_created_at_index',
        transaction,
      });

      // Composite index for user posts by date
      await queryInterface.addIndex('Posts', ['userId', 'createdAt'], {
        name: 'posts_user_date_index',
        transaction,
      });

      // Composite index for community posts by date
      await queryInterface.addIndex('Posts', ['communityId', 'createdAt'], {
        name: 'posts_community_date_index',
        transaction,
      });

      await transaction.commit();
      console.log(
        'Posts table created successfully with all constraints and indexes'
      );
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to create Posts table:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop the table (this will automatically drop all indexes and constraints)
      await queryInterface.dropTable('Posts', { transaction });

      await transaction.commit();
      console.log('Posts table dropped successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to drop Posts table:', error);
      throw error;
    }
  },
};
