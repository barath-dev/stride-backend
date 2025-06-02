const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware.js');
const {
  createPost,
  getPosts,
  deleteAllPost,
} = require('../controllers/social/post/post.controller.js');
const { likePost, unlikePost } = require('../controllers/social/post/like.controller.js');

const socialRoutes = Router();

socialRoutes.use(authMiddleware);

socialRoutes.get('/getAllPosts', getPosts);

socialRoutes.post('/createPost', createPost);

socialRoutes.delete('/deleteAllPost', deleteAllPost);

// socialRoutes.post('createPostByActivity');

socialRoutes.post('/followUser');

socialRoutes.post('/unfollowUser');

socialRoutes.put('/likePost', likePost);

socialRoutes.delete('/unlikePost', unlikePost);

socialRoutes.delete('/deletePost');

socialRoutes.get('/getProfile');

socialRoutes.get('/getUser/:id');

module.exports = socialRoutes;
