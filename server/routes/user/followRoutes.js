const express = require('express');
const { protectRoute } = require('../../middleware/authMiddleware');
const { sendConnectionRequest, getFollowStatus, withdrawRequest, acceptRequest, unfollowRequest, rejectRequest, followOrganization, unfollowOrganization, getOrgFollowStatus } = require('../../controllers/user/followController');
const router = express.Router();


router.get("/status/:username", protectRoute, getFollowStatus);
router.get("/orgStatus/:orgId", protectRoute,getOrgFollowStatus );
router.post('/withdraw/:username', protectRoute, withdrawRequest);
router.post("/request", protectRoute,sendConnectionRequest);
router.post("/accept", protectRoute,acceptRequest);
router.post("/reject", protectRoute,rejectRequest);
router.post("/unfollow/:username", protectRoute,unfollowRequest);
router.post('/:orgId/follow', protectRoute, followOrganization);
router.post('/:orgId/unfollow', protectRoute, unfollowOrganization);


module.exports = router