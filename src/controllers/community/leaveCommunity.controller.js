// Fixed leaveCommunity controller
const models = require('../../models');

const leaveCommunity = async (req, res) => {
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

    // Check if user is actually a member
    const currentFollowers = community.followers || [];

    if (!currentFollowers.includes(userId)) {
      return res.status(400).json({
        message: 'User is not a member of this community',
      });
    }

    // Remove user from followers array
    const updatedFollowers = currentFollowers.filter(
      followerId => followerId !== userId
    );

    await community.update({
      followers: updatedFollowers,
    });

    return res.status(200).json({
      message: 'User left the community successfully',
      community: {
        id: community.id,
        communityId: community.communityId,
        communityName: community.communityName,
        memberCount: updatedFollowers.length,
      },
    });
  } catch (error) {
    console.error('Leave community error:', error);
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

module.exports = leaveCommunity;
