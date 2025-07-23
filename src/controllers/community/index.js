const createCommunity = require('./createCommunity');
const { getCommunities, getCommunityById } = require('./getCommunities');
const updateCommunity = require('./updateCommunity');
const deleteCommunity = require('./deleteCommunity');
const joinCommunity = require('./joinCommunity');
const leaveCommunity = require('./leaveCommunity');
const { getCommunityMembers, checkMembership } = require('./communityMembers');
const { getCommunityPosts } = require('./communityPosts');
const { getCommunityStats } = require('./communityStats');

module.exports = {
  // CRUD Operations
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,

  // Membership Operations
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  checkMembership,

  // Content Operations
  getCommunityPosts,

  // Analytics
  getCommunityStats,
};
