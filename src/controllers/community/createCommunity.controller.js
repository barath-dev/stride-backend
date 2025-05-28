const models = require('../../models');
const { v4: uuidv4 } = require('uuid');

const createCommunity = async (req, res) => {
  const { profileUrl, name, description } = req.body;

  try {
    const communityId = uuidv4();
    const followers = [];
    const postIds = [];
    const community = await models.Community.create({
      communityId: communityId,
      profileUrl: profileUrl,
      communityName: name,
      communityDescription: description,
      followers: followers,
      postIds: postIds,
    });
    return res.status(201).json(community);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

module.exports = createCommunity;
