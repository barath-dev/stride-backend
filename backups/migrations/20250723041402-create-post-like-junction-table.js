'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PostLike', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      postId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'postId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      likedAt: {
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

    // Add composite unique constraint
    await queryInterface.addConstraint('PostLike', {
      fields: ['userId', 'postId'],
      type: 'unique',
      name: 'unique_user_post_like',
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('PostLike', ['userId'], {
      name: 'post_like_user_id_idx',
    });

    await queryInterface.addIndex('PostLike', ['postId'], {
      name: 'post_like_post_id_idx',
    });

    // Add index on likedAt for sorting likes by time
    await queryInterface.addIndex('PostLike', ['likedAt'], {
      name: 'post_like_liked_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PostLike');
  },
};
