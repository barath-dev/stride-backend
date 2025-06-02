const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware.js");
const saveActivity = require("../controllers/activity/saveActivity.cotroller.js");
const getActivities = require("../controllers/activity/getActivities.controller.js");
const deleteActivitybyId = require("../controllers/activity/deleteActivitybyId.controller.js");

const activityRoutes = Router();

activityRoutes.use(authMiddleware);

activityRoutes.post('/saveActivity',saveActivity);

activityRoutes.delete('/deleteActivity/:id',deleteActivitybyId);

activityRoutes.get('/getActivity/:id');

activityRoutes.get('/getActivities',getActivities);

activityRoutes.get('/getRecentActivity',getActivities);

module.exports = activityRoutes;