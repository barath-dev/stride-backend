const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware.js');
const {
  createPost,
  getPosts,
  getTrendingPosts,
  deletePost,
  deleteAllPost,
} = require('../controllers/social/post/post.controller.js');
const {
  likePost,
  unlikePost,
  bulkLikeStatus,
} = require('../controllers/social/post/like.controller.js');

const socialRoutes = Router();

// Apply authentication middleware to all routes
socialRoutes.use(authMiddleware);

// Post routes
socialRoutes.get('/getAllPosts', getPosts);
socialRoutes.get('/getTrendingPosts', getTrendingPosts);
socialRoutes.post('/createPost', createPost);
socialRoutes.delete('/deleteAllPost', deleteAllPost);
socialRoutes.delete('/deletePost/:id', deletePost);

// Like routes - FIXED: Changed from PUT/DELETE to POST/DELETE
socialRoutes.post('/likePost/:id', likePost);
socialRoutes.delete('/unlikePost/:id', unlikePost);
socialRoutes.post('/bulkLikeStatus', bulkLikeStatus);

// User interaction routes (placeholders for future implementation)
socialRoutes.post('/followUser', (req, res) => {
  res.status(501).json({
    message: 'Follow user feature not implemented yet',
    status: 'info',
  });
});

socialRoutes.post('/unfollowUser', (req, res) => {
  res.status(501).json({
    message: 'Unfollow user feature not implemented yet',
    status: 'info',
  });
});

// Profile routes (placeholders)
socialRoutes.get('/getProfile', (req, res) => {
  res.status(501).json({
    message:
      'Get profile feature not implemented yet - use /api/v1/user/profile instead',
    status: 'info',
  });
});

socialRoutes.get('/getUser/:id', (req, res) => {
  res.status(501).json({
    message: 'Get user by ID feature not implemented yet',
    status: 'info',
  });
});

module.exports = socialRoutes;
