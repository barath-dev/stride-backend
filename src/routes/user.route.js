const { Router } = require("express");
const getProfile = require("../controllers/user/getProfile.controller");
const authMiddleware = require("../middleware/auth.middleware");

const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.get("/profile",getProfile);

module.exports = userRoutes;