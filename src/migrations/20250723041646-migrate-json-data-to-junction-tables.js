'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all communities and their followers
    const communities = await queryInterface.sequelize.query(
      `SELECT "id", "communityId", "followers" FROM "Communities";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Insert followers into the UserCommunity table
    for (const community of communities) {
      const followers = community.followers || [];

      // Skip if no followers
      if (!Array.isArray(followers) || followers.length === 0) continue;

      // For each follower, create an entry in UserCommunity
      for (const userId of followers) {
        try {
          await queryInterface.sequelize.query(
            `INSERT INTO "UserCommunity" ("userId", "communityId", "role", "createdAt", "updatedAt")
             VALUES (?, ?, 'member', NOW(), NOW())
             ON CONFLICT ("userId", "communityId") DO NOTHING;`,
            {
              replacements: [userId, community.communityId],
              type: Sequelize.QueryTypes.INSERT,
            }
          );
        } catch (error) {
          console.error(
            `Error migrating follower ${userId} for community ${community.communityId}:`,
            error
          );
        }
      }
    }

    // Get all posts and their likedBy
    const posts = await queryInterface.sequelize.query(
      `SELECT "id", "postId", "likedBy" FROM "Posts";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Insert likes into the PostLike table
    for (const post of posts) {
      const likedBy = post.likedBy || [];

      // Skip if no likes
      if (!Array.isArray(likedBy) || likedBy.length === 0) continue;

      // For each like, create an entry in PostLike
      for (const userId of likedBy) {
        try {
          await queryInterface.sequelize.query(
            `INSERT INTO "PostLike" ("userId", "postId", "likedAt", "createdAt", "updatedAt")
             VALUES (?, ?, NOW(), NOW(), NOW())
             ON CONFLICT ("userId", "postId") DO NOTHING;`,
            {
              replacements: [userId, post.postId],
              type: Sequelize.QueryTypes.INSERT,
            }
          );
        } catch (error) {
          console.error(
            `Error migrating like from ${userId} for post ${post.postId}:`,
            error
          );
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // The down migration is not destructive, as it would be complex to
    // revert back to JSON arrays. If needed, the data can be manually
    // migrated back to JSON arrays.
    console.log(
      'Down migration for JSON data not implemented. Manual intervention required.'
    );
  },
};
