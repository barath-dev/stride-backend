const models = require('../../models');
const { Op } = require('sequelize');

const leaveCommunity = async (req, res) => {
  const { id } = req.params;
  try {
    const community = await models.Community.findOne({
      where: { communityId: id },
    });

    if (!community) {
      return res.status(404).json({
        message: 'Community not found',
      });
    }
    const userId = req.user.id;

    const isFollowerInCommunity = community.followers.includes(userId);

    if (!isFollowerInCommunity) {
      return res.status(400).json({
        message: 'User not joined the community',
      });
    }

    const currentFollowers = community.followers || [];
    community.followers = currentFollowers.filter(followerId => {
      return followerId.toString() !== userId.toString();
    });

    await community.save();

    return res.status(200).json({
      message: 'User left the community successfully',
    });
  } catch (error) {
    console.error('Error in leaveCommunity:', error);
    return res.status(500).json({
      message: 'Internal Server Error ' + error.message,
    });
  }
};

module.exports = leaveCommunity;
