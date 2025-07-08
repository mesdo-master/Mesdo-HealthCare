const express = require('express');
const { sendMessage, getMessages, checkRecuriter, orgLogoUpload, fetchOrgData, orgBannerUpload, updateProfile, initiateChatRecuriter, getAllConversations } = require('../../controllers/recruiter/recuriterController');
const { protectRoute } = require('../../middleware/authMiddleware');
const upload = require('../../config/multer');
const router = express.Router();

router.get('/checkRecuriter', protectRoute, checkRecuriter);
router.get('/fetchOrgData', protectRoute, fetchOrgData);
router.put('/updateProfile', protectRoute, updateProfile);
router.post('/organizationLogoUpload', protectRoute, upload.single('orgLogo'), orgLogoUpload);
router.post('/orgBannerUpload', protectRoute, upload.single('orgBanner'), orgBannerUpload);

router.post('/initiate', initiateChatRecuriter);
router.post('/sendMessage', protectRoute, sendMessage);
router.get('/getMessages/:conversationId', getMessages);
router.get('/allConversations', protectRoute, getAllConversations);

module.exports = router;