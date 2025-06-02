const { Router } = require("express");
const getProfile = require("../controllers/user/getProfile.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.get("/profile",getProfile);

module.exports = userRoutes;