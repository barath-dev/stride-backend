const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const saveActivity = require("../controllers/activity/saveActivity.cotroller");
const getActivities = require("../controllers/activity/getActivities.controller");

const activityRoutes = Router();

activityRoutes.use(authMiddleware);

activityRoutes.post('/saveActivity',saveActivity);

activityRoutes.get('/getActivity/:id');

activityRoutes.get('/getActivities',getActivities);

module.exports = activityRoutes;

