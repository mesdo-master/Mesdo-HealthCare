const express = require('express');
const { protectRoute } = require('../../middleware/authMiddleware');
const { getProfileInfo, updateUserInfo, updateProfilePic, updateCoverPic, fetchExperiences, fetchQualifications, handleUploads, sendConnectionRequest, getConnections } = require('../../controllers/user/userControllers');
const upload = require('../../config/multer');
const router = express.Router();

router.get('/getConnections',protectRoute,getConnections);
router.post('/upload-profile-pic',protectRoute,upload.single('profilePic'),updateProfilePic)
router.post('/upload-cover-pic',protectRoute,upload.single('coverPic'),updateCoverPic)
router.put('/updateProfile',protectRoute,updateUserInfo);
router.post('/upload',protectRoute,upload.single('file'),handleUploads);
router.get('/fetchExperiences',protectRoute,fetchExperiences);  
router.get('/fetchQualifications',protectRoute,fetchQualifications);
router.post('/:username',getProfileInfo)

module.exports = router;