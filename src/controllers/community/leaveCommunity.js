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
        status: 'error',
      });
    }

    const userId = req.user.userId;

    // Check if user is actually a member using the model method
    if (!community.isMember(userId)) {
      return res.status(400).json({
        message: 'User is not a member of this community',
        status: 'error',
      });
    }

    // Remove member using the model method
    const success = await community.removeMember(userId);

    if (success) {
      // Reload to get updated member count
      await community.reload();

      return res.status(200).json({
        message: 'User left the community successfully',
        status: 'success',
        data: {
          community: {
            id: community.id,
            communityId: community.communityId,
            communityName: community.communityName,
            memberCount: community.getMemberCount(),
          },
        },
      });
    } else {
      return res.status(400).json({
        message: 'Failed to leave community',
        status: 'error',
      });
    }
  } catch (error) {
    console.error('Leave community error:', error);
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
      status: 'error',
    });
  }
};

module.exports = leaveCommunity;
