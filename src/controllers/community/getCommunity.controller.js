const { where } = require('sequelize');
const models = require('../../models');

const getCommunities = async (req, res) => {
  try {
    const community = await models.Community.findAll();
    if (!community) {
      return res.status(404).json({
        message: 'Community not found',
      });
    }
    return res.status(200).json(community);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error ' + error.message,
    });
  }
};

const getCommunitybyId = async (req, res) => {
  const communityId = req.params.id;
  try {
    console.log(communityId);
    const community = await models.Community.findOne({
      where: { communityId: communityId },
    });
    if (!community) {
      return res.status(404).json({
        message: 'Community not found',
      });
    }
    return res.status(200).json(community);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error ' + error.message,
    });
  }
};

module.exports = {
  getCommunities,
  getCommunitybyId,
};
