// Fixed joinCommunity controller
const models = require('../../models');
const { Sequelize } = require('sequelize');

const joinCommunity = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the community by communityId
    const community = await models.Community.findOne({
      where: { communityId: id },
    });

    if (!community) {
      return res.status(404).json({
        message: 'Community not found',
      });
    }

    const userId = req.user.userId;

    // Fix 1: Properly check if user is already a follower
    // The previous query was incorrect for JSON arrays
    const currentFollowers = community.followers || [];

    if (currentFollowers.includes(userId)) {
      return res.status(400).json({
        message: 'User already joined the community',
      });
    }

    // Fix 2: Use Sequelize's JSON operators for updating
    const updatedFollowers = [...currentFollowers, userId];

    await community.update({
      followers: updatedFollowers,
    });

    return res.status(200).json({
      message: 'User joined the community successfully',
      community: {
        id: community.id,
        communityId: community.communityId,
        communityName: community.communityName,
        memberCount: updatedFollowers.length,
      },
    });
  } catch (error) {
    console.error('Join community error:', error);
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

module.exports = joinCommunity;
