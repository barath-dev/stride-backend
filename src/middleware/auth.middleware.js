const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
// Import all models from the index file
const models = require("../models");

const authMiddleware = async (req, res, next) => {
  console.log("authMiddleware");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
      status: "error",
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  // Verify token
  let tokenData;
  try {
    console.log("middleware");
    tokenData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
      status: "error",
    });
  }

  // Find user
  const foundUser = await models.User.findOne({
    where: { userId: tokenData.userId }
  });



  if (!foundUser) {
    return res.status(401).json({
      message: "Invalid token",
      status: "error",
    });
  }

  console.log("middleware passed");

  req.user = foundUser;
  next();
};


module.exports = authMiddleware;