// utils/modelHelpers.js
const { User, Post, Community } = require('../models');

class ModelHelpers {
  // Find user by legacy ID or new UUID
  static async findUser(identifier) {
    if (!identifier) return null;

    // Try finding by UUID first
    let user = await User.findByPk(identifier);

    // If not found and identifier looks like legacy ID, try legacy lookup
    if (!user && typeof identifier === 'string' && identifier.length < 36) {
      user = await User.findOne({ where: { legacyUserId: identifier } });
    }

    return user;
  }

  // Find post by legacy ID or new UUID
  static async findPost(identifier) {
    if (!identifier) return null;

    // Try finding by UUID first
    let post = await Post.findByPk(identifier);

    // If not found and identifier looks like legacy ID, try legacy lookup
    if (!post && typeof identifier === 'string' && identifier.length < 36) {
      post = await Post.findOne({ where: { legacyPostId: identifier } });
    }

    return post;
  }

  // Find community by legacy ID or new UUID
  static async findCommunity(identifier) {
    if (!identifier) return null;

    // Try finding by UUID first
    let community = await Community.findByPk(identifier);

    // If not found and identifier looks like legacy ID, try legacy lookup
    if (
      !community &&
      typeof identifier === 'string' &&
      identifier.length < 36
    ) {
      community = await Community.findOne({
        where: { legacyCommunityId: identifier },
      });
    }

    return community;
  }

  // Get user's posts with pagination
  static async getUserPosts(userId, options = {}) {
    const user = await this.findUser(userId);
    if (!user) return null;

    return await Post.findAll({
      where: { userId: user.id, isActive: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'category'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 20,
      offset: options.offset || 0,
    });
  }

  // Like/Unlike post
  static async togglePostLike(postId, userId) {
    const post = await this.findPost(postId);
    const user = await this.findUser(userId);

    if (!post || !user) return null;

    const { PostLikes } = require('../models');

    const existingLike = await PostLikes.findOne({
      where: { postId: post.id, userId: user.id },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement('likeCount');
      return { liked: false, likeCount: post.likeCount - 1 };
    } else {
      // Like
      await PostLikes.create({ postId: post.id, userId: user.id });
      await post.increment('likeCount');
      return { liked: true, likeCount: post.likeCount + 1 };
    }
  }

  // Follow/Unfollow community
  static async toggleCommunityFollow(communityId, userId) {
    const community = await this.findCommunity(communityId);
    const user = await this.findUser(userId);

    if (!community || !user) return null;

    const { UserCommunityFollows } = require('../models');

    const existingFollow = await UserCommunityFollows.findOne({
      where: { communityId: community.id, userId: user.id },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      await community.decrement('followerCount');
      return { following: false, followerCount: community.followerCount - 1 };
    } else {
      // Follow
      await UserCommunityFollows.create({
        communityId: community.id,
        userId: user.id,
      });
      await community.increment('followerCount');
      return { following: true, followerCount: community.followerCount + 1 };
    }
  }
}

module.exports = ModelHelpers;
