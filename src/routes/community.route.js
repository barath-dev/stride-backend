const { Router } = require('express');

const communityRoutes = Router();

// Middleware
const authMiddleware = require('../middleware/auth.middleware');

const {
  getCommunities,
  getCommunityById, // ✅ RENAMED from getCommunitybyId
} = require('../controllers/community/getCommunities'); // ✅ UPDATED: Remove .controller.js

const createCommunity = require('../controllers/community/createCommunity'); // ✅ UPDATED
const deleteCommunity = require('../controllers/community/deleteCommunity'); // ✅ UPDATED
const joinCommunity = require('../controllers/community/joinCommunity'); // ✅ UPDATED
const leaveCommunity = require('../controllers/community/leaveCommunity'); // ✅ UPDATED
const updateCommunity = require('../controllers/community/updateCommunity'); // ✅ UPDATED

const {
  getCommunityMembers,
  checkMembership,
} = require('../controllers/community/communityMembers');

// Get all communities with filtering/pagination
// GET /api/communities?page=1&limit=20&category=Running&search=fitness
communityRoutes.get('/', getCommunities); // ✅ CHANGED: RESTful path

// Get specific community by ID
// GET /api/communities/:id
communityRoutes.get('/:id', getCommunityById); // ✅ CHANGED: RESTful path

// Get community members/followers
// GET /api/communities/:id/members?page=1&limit=20
communityRoutes.get('/:id/members', getCommunityMembers); // ✅ NEW

// =====================================
// PROTECTED ROUTES (Authentication Required)
// =====================================

// Create new community
// POST /api/communities
communityRoutes.post('/', authMiddleware, createCommunity); // ✅ CHANGED: RESTful path

// Update community (only creator or admin)
// PUT /api/communities/:id
// communityRoutes.put('/:id', authMiddleware, updateCommunity); // ✅ CHANGED: RESTful path

// Delete community (only creator or admin)
// DELETE /api/communities/:id
// communityRoutes.delete('/:id', authMiddleware, deleteCommunity); // ✅ CHANGED: RESTful path

// Join community
// POST /api/communities/:id/join
// communityRoutes.post('/:id/join', authMiddleware, joinCommunity); // ✅ CHANGED: POST method

// Leave community
// POST /api/communities/:id/leave
// communityRoutes.post('/:id/leave', authMiddleware, leaveCommunity); // ✅ CHANGED: POST method

// Check if user is member of community
// GET /api/communities/:id/membership
communityRoutes.get('/:id/membership', authMiddleware, checkMembership); // ✅ NEW

module.exports = communityRoutes;

// =====================================
// ROUTE COMPARISON: OLD vs NEW
// =====================================

/*
OLD ROUTES (Non-RESTful):
❌ GET  /getCommunity/:id          → ✅ GET    /communities/:id
❌ GET  /getCommunities            → ✅ GET    /communities
❌ POST /createCommunity           → ✅ POST   /communities
❌ PUT  /updateCommunity/:id       → ✅ PUT    /communities/:id
❌ DELETE /deleteCommunity/:id     → ✅ DELETE /communities/:id
❌ PUT  /joinCommunity/:id         → ✅ POST   /communities/:id/join
❌ PUT  /leaveCommunity/:id        → ✅ POST   /communities/:id/leave

NEW ROUTES (RESTful):
✅ GET    /communities              - Get all communities (public)
✅ GET    /communities/:id          - Get specific community (public)
✅ POST   /communities              - Create community (auth required)
✅ PUT    /communities/:id          - Update community (auth required)
✅ DELETE /communities/:id          - Delete community (auth required)
✅ POST   /communities/:id/join     - Join community (auth required)
✅ POST   /communities/:id/leave    - Leave community (auth required)
✅ GET    /communities/:id/members  - Get community members (public)
✅ GET    /communities/:id/membership - Check user membership (auth required)

BENEFITS OF NEW STRUCTURE:
1. ✅ Follows REST conventions
2. ✅ Correct HTTP methods for actions
3. ✅ Cleaner URLs
4. ✅ Better security (public vs protected routes)
5. ✅ More functionality
6. ✅ Industry standard patterns
*/

// =====================================
// EXAMPLE API USAGE
// =====================================

/*
// Get all communities with filtering
GET /api/communities?category=Running&search=marathon&page=1&limit=10

// Get specific community
GET /api/communities/550e8400-e29b-41d4-a716-446655440000

// Create new community (requires auth)
POST /api/communities
{
  "name": "Marathon Runners",
  "description": "Community for marathon enthusiasts",
  "category": "Running",
  "profileImageUrl": "https://example.com/image.jpg"
}

// Join community (requires auth)
POST /api/communities/550e8400-e29b-41d4-a716-446655440000/join

// Check if user is member (requires auth)
GET /api/communities/550e8400-e29b-41d4-a716-446655440000/membership

// Get community members (public)
GET /api/communities/550e8400-e29b-41d4-a716-446655440000/members?page=1&limit=20

// Update community (requires auth + ownership)
PUT /api/communities/550e8400-e29b-41d4-a716-446655440000
{
  "description": "Updated description"
}
*/

// =====================================
// MAIN APP USAGE
// =====================================

/*
// In your main app.js or routes/index.js:
const communityRoutes = require('./routes/community');

// Mount the routes
app.use('/api/communities', communityRoutes);

// This creates routes like:
// /api/communities
// /api/communities/:id
// /api/communities/:id/join
// etc.
*/
