const { catchAsync } = require('../../../utils/catchAsync');
const models = require('../../../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const createPost = catchAsync(async (req, res, next) => {
  const { caption, image, category, stats, communityId } = req.body;
  const { userId } = req.user;

  try {
    if (!image || !category) {
      return res.status(400).json({
        message: 'Image and category are required fields',
        status: 'error',
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
        status: 'error',
      });
    }

    // Validate community exists if provided
    let validCommunityId = null;
    if (communityId) {
      const community = await models.Community.findOne({
        where: { communityId },
        attributes: ['id'],
      });

      if (!community) {
        return res.status(400).json({
          message: 'Invalid community ID',
          status: 'error',
        });
      }
      validCommunityId = community.id;
    }

    // Create post with optimized data
    const post = await models.Post.create({
      postId: uuidv4(),
      caption: caption || null,
      imageUrl: image,
      category,
      userId,
      stats: stats || null,
      likedBy: [],
      likeCount: 0,
      communityId: validCommunityId,
      isActive: true,
    });

    // Fetch the created post with associations
    const createdPost = await models.Post.findOne({
      where: { postId: post.postId },
      include: [
        {
          model: models.User,
          as: 'author',
          attributes: ['userId', 'firstName', 'lastName', 'profileImageUrl'],
        },
        {
          model: models.Community,
          as: 'community',
          attributes: ['communityId', 'communityName', 'profileUrl'],
          required: false,
        },
      ],
    });

    res.status(201).json({
      message: 'Post created successfully',
      status: 'success',
      data: createdPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    next(error);
  }
});

const getPosts = catchAsync(async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      userId: filterUserId,
      communityId,
      sort = 'recent',
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isActive: true };
    let orderClause;

    // Apply filters
    if (category) {
      whereClause.category = category;
    }

    if (filterUserId) {
      whereClause.userId = filterUserId;
    }

    if (communityId) {
      const community = await models.Community.findOne({
        where: { communityId },
        attributes: ['id'],
      });

      if (community) {
        whereClause.communityId = community.id;
      }
    }

    // Apply sorting
    switch (sort) {
      case 'popular':
        orderClause = [
          ['likeCount', 'DESC'],
          ['createdAt', 'DESC'],
        ];
        break;
      case 'oldest':
        orderClause = [['createdAt', 'ASC']];
        break;
      default: // recent
        orderClause = [['createdAt', 'DESC']];
    }

    // Optimized query with pagination and includes
    const { count, rows: posts } = await models.Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.User,
          as: 'author',
          attributes: ['userId', 'firstName', 'lastName', 'profileImageUrl'],
          required: true,
        },
        {
          model: models.Community,
          as: 'community',
          attributes: ['communityId', 'communityName', 'profileUrl'],
          required: false,
        },
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      message: 'Posts fetched successfully',
      status: 'success',
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPosts: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    next(error);
  }
});

// Get trending posts (most liked in last 7 days)
const getTrendingPosts = catchAsync(async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await models.Post.findAll({
      where: {
        isActive: true,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
        likeCount: {
          [Op.gt]: 0,
        },
      },
      include: [
        {
          model: models.User,
          as: 'author',
          attributes: ['userId', 'firstName', 'lastName', 'profileImageUrl'],
        },
        {
          model: models.Community,
          as: 'community',
          attributes: ['communityId', 'communityName', 'profileUrl'],
          required: false,
        },
      ],
      order: [
        ['likeCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit),
    });

    res.status(200).json({
      message: 'Trending posts fetched successfully',
      status: 'success',
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    next(error);
  }
});

// Soft delete post
const deletePost = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const post = await models.Post.findOne({
      where: {
        postId: id,
        userId,
        isActive: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found or you do not have permission to delete it',
        status: 'error',
      });
    }

    // Soft delete
    await post.update({ isActive: false });

    res.status(200).json({
      message: 'Post deleted successfully',
      status: 'success',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    next(error);
  }
});

// Delete all posts (for admin/testing)
const deleteAllPost = catchAsync(async (req, res, next) => {
  try {
    const deletedCount = await models.Post.update(
      { isActive: false },
      { where: { isActive: true } }
    );

    res.status(200).json({
      message: 'All posts deleted successfully',
      status: 'success',
      data: { deletedCount },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createPost,
  getPosts,
  getTrendingPosts,
  deletePost,
  deleteAllPost,
};
