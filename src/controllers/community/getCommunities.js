const { Op } = require('sequelize');
const models = require('../../models');
const ModelHelpers = require('../../utils/modelHelper.js');

/**
 * Get all communities with pagination and filtering
 * @route GET /api/communities
 * @access Public
 */
const getCommunities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = { isActive: true };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Validate sort options
    const allowedSortFields = [
      'createdAt',
      'name',
      'followerCount',
      'postCount',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const communities = await models.Community.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
        },
      ],
      attributes: {
        exclude: ['legacyFollowers', 'legacyPostIds', 'legacyCommunityId'],
      },
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        communities: communities.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: communities.count,
          pages: Math.ceil(communities.count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get communities error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get community by ID
 * @route GET /api/communities/:id
 * @access Public
 */
const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeStats = false } = req.query;

    const community = await ModelHelpers.findCommunity(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    // Build include array
    const includeArray = [
      {
        model: models.User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
      },
    ];

    // Optionally include recent posts
    if (includeStats === 'true') {
      includeArray.push({
        model: models.Post,
        as: 'posts',
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: models.User,
            as: 'author',
            attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
          },
        ],
      });
    }

    const communityDetails = await models.Community.findByPk(community.id, {
      include: includeArray,
      attributes: {
        exclude: ['legacyFollowers', 'legacyPostIds'],
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        community: communityDetails,
      },
    });
  } catch (error) {
    console.error('Get community by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getCommunities,
  getCommunityById,
};
