const models = require('../../models');
const { v4: uuidv4 } = require('uuid');

const createCommunity = async (req, res) => {
  try {
    const { communityName, communityDescription, category, profileUrl } =
      req.body;

    // Validation
    if (!communityName || !communityDescription || !category) {
      return res.status(400).json({
        message:
          'Missing required fields: communityName, communityDescription, and category are required',
      });
    }

    // Validate community name length
    if (communityName.trim().length < 3 || communityName.trim().length > 50) {
      return res.status(400).json({
        message: 'Community name must be between 3 and 50 characters',
      });
    }

    // Validate description length
    if (
      communityDescription.trim().length < 10 ||
      communityDescription.trim().length > 500
    ) {
      return res.status(400).json({
        message: 'Community description must be between 10 and 500 characters',
      });
    }

    // Validate category
    const allowedCategories = [
      'Running',
      'Cycling',
      'Yoga',
      'Hiking',
      'Fitness',
      'Swimming',
      'Basketball',
      'Tennis',
      'Soccer',
      'Other',
    ];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message:
          'Invalid category. Must be one of: ' + allowedCategories.join(', '),
      });
    }

    // Check if community name already exists
    const existingCommunity = await models.Community.findOne({
      where: { communityName: communityName.trim() },
    });

    if (existingCommunity) {
      return res.status(409).json({
        message: 'A community with this name already exists',
      });
    }

    // Generate unique community ID
    const communityId = uuidv4();

    // Create community
    const community = await models.Community.create({
      communityId: communityId,
      communityName: communityName.trim(),
      communityDescription: communityDescription.trim(),
      category: category,
      profileUrl: profileUrl || null,
      followers: [],
      postIds: [],
    });

    // Return the created community with full details
    return res.status(201).json({
      message: 'Community created successfully',
      community: {
        id: community.id,
        communityId: community.communityId,
        communityName: community.communityName,
        communityDescription: community.communityDescription,
        category: community.category,
        profileUrl: community.profileUrl,
        followers: community.followers,
        postIds: community.postIds,
        createdAt: community.createdAt,
        updatedAt: community.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create community error:', error);

    // Handle specific Sequelize errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'A community with this name already exists',
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message,
    });
  }
};

module.exports = createCommunity;
