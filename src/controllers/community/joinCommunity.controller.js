const models = require('../../models');

const joinCommunity = async (req, res) => {
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

    console.log(community);

    const userId = req.user.id;

    const isFollower = models.Community.findOne({
      where: {
        communityId: id,
        followers: userId,
      },
    });
    if (isFollower) {
      return res.status(400).json({
        message: 'User already joined the community',
      });
    }
    community.followers.push(userId);
    await community.save();

    console.log();
    return res.status(200).json({
      message: 'User joined the community successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error ' + error.message,
    });
  }
};

module.exports = joinCommunity;
