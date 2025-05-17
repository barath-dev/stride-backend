const { Router } = require("express");
const { createPost, getPosts, deleteAllPost } = require("../controllers/social/post.controller");

const socialRoutes = Router();

socialRoutes.get('/getAllPosts',getPosts);

socialRoutes.post('/createPost',createPost);

socialRoutes.delete('/deleteAllPost',deleteAllPost);

socialRoutes.post('createPostByActivity');

socialRoutes.put('/likePost');

socialRoutes.delete('/deletePost');

socialRoutes.get('/getProfile');

socialRoutes.get('/getUser/:id');

module.exports = socialRoutes;