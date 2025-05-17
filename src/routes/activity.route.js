const { Router } = require("express");

const activityRoutes = Router();

activityRoutes.get('/saveActivity');

activityRoutes.get('/getActivity');

activityRoutes.get('/getActivities');

module.exports = activityRoutes;

