const models = require('../../../models');
const { catchAsync } = require('../../../utils/catchAsync');

const likePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const post = await models.Post.findOne({
      where: { postId: id, isActive: true },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        status: 'error',
      });
    }

    // Check if already liked
    if (post.isLikedBy(userId)) {
      return res.status(400).json({
        message: 'Post already liked',
        status: 'error',
      });
    }

    // Add like using the model method
    const success = await post.addLike(userId);

    if (success) {
      // Refresh the post to get updated like count
      await post.reload();

      res.status(200).json({
        message: 'Post liked successfully',
        status: 'success',
        data: {
          postId: post.postId,
          likeCount: post.likeCount,
          isLiked: true,
        },
      });
    } else {
      res.status(400).json({
        message: 'Failed to like post',
        status: 'error',
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

const unlikePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const post = await models.Post.findOne({
      where: { postId: id, isActive: true },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        status: 'error',
      });
    }

    // Check if not liked
    if (!post.isLikedBy(userId)) {
      return res.status(400).json({
        message: 'Post not liked by user',
        status: 'error',
      });
    }

    // Remove like using the model method
    const success = await post.removeLike(userId);

    if (success) {
      // Refresh the post to get updated like count
      await post.reload();

      res.status(200).json({
        message: 'Post unliked successfully',
        status: 'success',
        data: {
          postId: post.postId,
          likeCount: post.likeCount,
          isLiked: false,
        },
      });
    } else {
      res.status(400).json({
        message: 'Failed to unlike post',
        status: 'error',
      });
    }
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

// Bulk like operations for better performance
const bulkLikeStatus = async (req, res) => {
  const { postIds } = req.body;
  const { userId } = req.user;

  try {
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        message: 'PostIds array is required',
        status: 'error',
      });
    }

    const posts = await models.Post.findAll({
      where: {
        postId: { [models.sequelize.Op.in]: postIds },
        isActive: true,
      },
      attributes: ['postId', 'likedBy', 'likeCount'],
    });

    const likeStatus = posts.map(post => ({
      postId: post.postId,
      isLiked: post.isLikedBy(userId),
      likeCount: post.likeCount,
    }));

    res.status(200).json({
      message: 'Bulk like status fetched successfully',
      status: 'success',
      data: likeStatus,
    });
  } catch (error) {
    console.error('Bulk like status error:', error);
    res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

module.exports = {
  likePost,
  unlikePost,
  bulkLikeStatus,
};
