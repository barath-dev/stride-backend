const { Router } = require("express");
const {fetchAllUsers, deleteAllUsers} = require("../controllers/testing/fetchAllUsers.js");
const testPost = require("../controllers/testing/testPost.js");
const {truncateOtpTable, fetchAllOtp} = require("../controllers/testing/truncateOtpTable.js");


const testingRoutes = Router();

testingRoutes.get("/fetchAllUsers",fetchAllUsers);

testingRoutes.delete("/deleteAllUsers",deleteAllUsers);

testingRoutes.post('/testPostData',testPost);

testingRoutes.delete('/truncateOtpTable',truncateOtpTable);

testingRoutes.get('/fetchAllOtp',fetchAllOtp);

 
module.exports = testingRoutes;