const { Router } = require("express");
const {fetchAllUsers, deleteAllUsers} = require("../controllers/testing/fetchAllUsers.js");
const testPost = require("../controllers/testing/testPost.js");


const testingRoutes = Router();

testingRoutes.get("/fetchAllUsers",fetchAllUsers);

testingRoutes.delete("/deleteAllUsers",deleteAllUsers);

testingRoutes.post('/testPostData',testPost);

 
module.exports = testingRoutes;