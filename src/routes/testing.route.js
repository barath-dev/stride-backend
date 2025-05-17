const { Router } = require("express");
const {fetchAllUsers, deleteAllUsers} = require("../controllers/testing/fetchAllUsers");
const testPost = require("../controllers/testing/testPost");


const testingRoutes = Router();

testingRoutes.get("/fetchAllUsers",fetchAllUsers);

testingRoutes.delete("/deleteAllUsers",deleteAllUsers);

testingRoutes.post('/testPostData',testPost);

 
module.exports = testingRoutes;