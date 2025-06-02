const { catchAsync } = require('../../../utils/catchAsync');
const models = require('../../../models');
const { v4: uuidv4 } = require('uuid');

const createPost = catchAsync(async (req, res, next) => {
  const { caption, image, category, stats, communityId } = req.body;
  console.log(req.user);
  const { userId } = req.user;

  try {
    if (!caption || !image || !category) {
      return res.status(400).json({
        message:
          'Missing required fields: caption, image, and category are required',
      });
    }

    // Fixed variable declaration and assignment
    let cId = communityId || null;

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

    // Create id for post
    const postId = uuidv4();

    const post = await models.Post.create({
      caption: caption,
      imageUrl: image,
      category: category, // Added missing category field
      userId: userId,
      stats: stats,
      likedBy: [],
      postId: postId,
      likeCount: 0,
      communityId: cId,
    });

    res.status(201).json({
      message: 'Post created successfully',
      status: 'success',
      data: post,
    });
  } catch (error) {
    next(error);
  }
});

const getPosts = catchAsync(async (req, res, next) => {
  console.log('getPosts');
  try {
    const posts = await models.Post.findAll({
      // Optional: include Community data if needed
      // include: [{ model: Community }],
      order: [['createdAt', 'DESC']], // Show newest posts first
    });

    if (!posts) {
      return res.status(404).json({
        message: 'No posts found',
        status: 'error',
      });
    }

    console.log(posts);

    res.status(200).json({
      message: 'Posts fetched successfully',
      status: 'success',
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({
      message: 'Internal Server Error - Failed to fetch posts',
      status: 'error',
    });
    next(error);
  }
});

// Delete all posts
const deleteAllPost = catchAsync(async (req, res, next) => {
  try {
    const deletedCount = await models.Post.destroy({ where: {} }); //NOTE: Better than truncate for foreign key constraints

    res.status(200).json({
      message: 'Posts deleted successfully',
      status: 'success',
      data: { deletedCount },
    });
  } catch (error) {
    next(error);
  }
});

// Delete single post
const deletePost = catchAsync(async (req, res, next) => {
  try {
    const deletedRows = await models.Post.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        message: 'Post not found',
        status: 'error',
      });
    }

    res.status(200).json({
      message: 'Post deleted successfully',
      status: 'success',
      data: { deletedRows },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createPost,
  getPosts,
  deleteAllPost,
  deletePost,
};
