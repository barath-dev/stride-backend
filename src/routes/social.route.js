const { Router } = require("express");
const { createPost, getPosts, deleteAllPost } = require("../controllers/social/post.controller");
const authMiddleware = require("../middleware/auth.middleware");

const socialRoutes = Router();

socialRoutes.use(authMiddleware);

socialRoutes.get('/getAllPosts',getPosts);

socialRoutes.post('/createPost',createPost);

socialRoutes.delete('/deleteAllPost',deleteAllPost);

// socialRoutes.post('createPostByActivity');

socialRoutes.post('/followUser');

socialRoutes.post('/unfollowUser');

socialRoutes.put('/likePost');

socialRoutes.delete('/deletePost');

socialRoutes.get('/getProfile');

socialRoutes.get('/getUser/:id');

module.exports = socialRoutes;