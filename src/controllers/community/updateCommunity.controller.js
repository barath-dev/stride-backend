const models = require('../../models');

const updateCommunity = async (req, res) => {
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
    const { name, description, profileUrl } = req.body;

    if (!name && !description && !profileUrl) {
      return res.status(400).json({
        message: 'At least one field is required',
      });
    }

    if (name) {
      community.communityName = name;
    }

    if (description) {
      community.communityDescription = description;
    }

    if (profileUrl) {
      community.profileUrl = profileUrl;
    }

    await community.save();
    return res.status(200).json({
      message: 'Community updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

module.exports = updateCommunity;
