const models = require('../../../models');
const { v4: uuidv4 } = require('uuid');

const likePost = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the post by postId
    const post = await models.Post.findOne({
      where: { postId: id },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        status: 'error',
      });
    }

    const userId = req.user.userId;

    // Check if user already liked the post
    const currentLikes = post.likedBy || [];

    if (currentLikes.includes(userId)) {
      return res.status(400).json({
        message: 'User already liked the post',
        status: 'error',
      });
    }

    // Add userId to likedBy array
    const updatedLikes = [...currentLikes, userId];

    await post.update({
      likedBy: updatedLikes,
    });

    return res.status(200).json({
      message: 'Post liked successfully',
      status: 'success',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

//unlike post
const unlikePost = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the post by postId
    const post = await models.Post.findOne({
      where: { postId: id },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        status: 'error',
      });
    }

    const userId = req.user.userId;

    // Check if user already liked the post
    const currentLikes = post.likedBy || [];

    if (!currentLikes.includes(userId)) {
      return res.status(400).json({
        message: 'User is not liked the post',
        status: 'error',
      });
    }

    // Remove userId from likedBy array
    const updatedLikes = currentLikes.filter(likerId => likerId !== userId);

    await post.update({
      likedBy: updatedLikes,
    });

    return res.status(200).json({
      message: 'Post unliked successfully',
      status: 'success',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = likePost;
