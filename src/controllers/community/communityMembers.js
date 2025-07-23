const models = require('../../models');
const ModelHelpers = require('../../utils/modelHelper');

/**
 * Get community members/followers
 * @route GET /api/communities/:id/members
 * @access Public
 */
const getCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const community = await ModelHelpers.findCommunity(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    const followers = await models.User.findAndCountAll({
      include: [
        {
          model: models.Community,
          as: 'followedCommunities',
          where: { id: community.id },
          through: {
            attributes: ['createdAt'], // Include join date
            as: 'followInfo',
          },
        },
      ],
      attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['followedCommunities', 'UserCommunityFollows', 'createdAt', 'DESC'],
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        members: followers.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: followers.count,
          pages: Math.ceil(followers.count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get community members error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Check if user is a member of community
 * @route GET /api/communities/:id/membership
 * @access Private
 */
const checkMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await ModelHelpers.findCommunity(id);
    const user = await ModelHelpers.findUser(req.user.id || req.user.userId);

    if (!community || !user) {
      return res.status(404).json({
        success: false,
        message: 'Community or user not found',
      });
    }

    const membership = await models.UserCommunityFollows.findOne({
      where: { userId: user.id, communityId: community.id },
    });

    return res.status(200).json({
      success: true,
      data: {
        isMember: !!membership,
        joinedAt: membership?.createdAt || null,
      },
    });
  } catch (error) {
    console.error('Check membership error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getCommunityMembers,
  checkMembership,
};
