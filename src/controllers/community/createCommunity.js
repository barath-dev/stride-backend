const models = require('../../models');
const ModelHelpers = require('../../utils/modelHelper');

/**
 * Create a new community
 * @route POST /api/communities
 * @access Private
 */
const createCommunity = async (req, res) => {
  try {
    const { name, description, category, profileImageUrl } = req.body;

    // Validation
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: name, description, and category are required',
      });
    }

    // Validate lengths
    if (name.trim().length < 3 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Community name must be between 3 and 100 characters',
      });
    }

    if (description.trim().length < 10 || description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Community description must be between 10 and 1000 characters',
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
      'General',
    ];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid category. Must be one of: ' + allowedCategories.join(', '),
      });
    }

    // Check if community name already exists
    const existingCommunity = await models.Community.findOne({
      where: { name: name.trim() },
    });

    if (existingCommunity) {
      return res.status(409).json({
        success: false,
        message: 'A community with this name already exists',
      });
    }

    // Get creator
    const creator = await ModelHelpers.findUser(req.user.id || req.user.userId);
    if (!creator) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create community
    const community = await models.Community.create({
      name: name.trim(),
      description: description.trim(),
      category: category,
      profileImageUrl: profileImageUrl || null,
      creatorId: creator.id,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: {
        community: {
          id: community.id,
          name: community.name,
          description: community.description,
          category: community.category,
          profileImageUrl: community.profileImageUrl,
          creatorId: community.creatorId,
          followerCount: community.followerCount,
          postCount: community.postCount,
          createdAt: community.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Create community error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'A community with this name already exists',
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = createCommunity;
