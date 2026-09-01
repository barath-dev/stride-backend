const models = require('../../models');

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
        status: 'error',
      });
    }

    const userId = req.user.userId;

    // Check if user is already a member using the model method
    if (community.isMember(userId)) {
      return res.status(400).json({
        message: 'User already joined the community',
        status: 'error',
      });
    }

    // Add member using the model method
    const success = await community.addMember(userId);

    if (success) {
      // Reload to get updated member count
      await community.reload();

      return res.status(200).json({
        message: 'User joined the community successfully',
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
        message: 'Failed to join community',
        status: 'error',
      });
    }
  } catch (error) {
    console.error('Join community error:', error);
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
      status: 'error',
    });
  }
};

module.exports = joinCommunity;
