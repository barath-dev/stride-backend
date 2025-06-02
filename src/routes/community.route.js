const { Router } = require('express');

const communityRoutes = Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  getCommunities,
  getCommunitybyId,
} = require('../controllers/community/getCommunity.controller.js');
const createCommunity = require('../controllers/community/createCommunity.controller.js');
const deleteCommunity = require('../controllers/community/deleteCommunity.controller.js');
const joinCommunity = require('../controllers/community/joinCommunity.controller.js');
const leaveCommunity = require('../controllers/community/leaveCommunity.controller.js');
const updateCommunity = require('../controllers/community/updateCommunity.controller.js');

communityRoutes.use(authMiddleware);

//only admin can create, delete and update community
//TODO: add middleware for admin

communityRoutes.get('/getCommunity/:id', getCommunitybyId);

communityRoutes.get('/getCommunities', getCommunities);

communityRoutes.post('/createCommunity', createCommunity);

communityRoutes.delete('/deleteCommunity/:id', deleteCommunity);

communityRoutes.put('/updateCommunity/:id', updateCommunity);

communityRoutes.put('/joinCommunity/:id', joinCommunity);

communityRoutes.put('/leaveCommunity/:id', leaveCommunity);

module.exports = communityRoutes;
