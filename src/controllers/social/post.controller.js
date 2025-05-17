const { catchAsync } = require("../../utils/catchAsync");
const { Post } = require("../../models");


const createPost = catchAsync(
    async (req, res, next) => {
        const { title, description, image, category, userId ,stats} = req.body;
        try {

            const post = await Post.create({
                title,
                description,
                image,
                category,
                userId,
                stats
            });


            res.status(201).json({
                message: "Post created successfully",
                status: "success",
                data: post
            });
        } catch (error) {
            next(error);
        }
    }
);

const getPosts = catchAsync(
    async (req, res, next) => {
        console.log("getPosts");
        try {
            const posts = await Post.findAll({
                // where: {
                //     userId: req.params.userId
                // }
            });
            res.status(200).json({
                message: "Posts fetched successfully",
                status: "success",
                data: posts
            });
        } catch (error) {
            next(error);
        }
    }
);

//delete all posts
const deleteAllPost = catchAsync(
    async (req, res, next) => {
        try {
            const posts = await Post.truncate();
            res.status(200).json({
                message: "Posts deleted successfully",
                status: "success",
                data: posts
            });
        } catch (error) {
            next(error);
        }
    }
);

//delete post
const deletePost = catchAsync(
    async (req, res, next) => {
        try {
            const post = await Post.destroy({
                where: {
                    id: req.params.id
                }
            });
            res.status(200).json({
                message: "Post deleted successfully",
                status: "success",
                data: post
            });
        } catch (error) {
            next(error);
        }
    }
);


module.exports = {
    createPost,
    getPosts,
    deleteAllPost,
    deletePost
};