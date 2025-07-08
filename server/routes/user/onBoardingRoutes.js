const express = require('express');
const { completeOnboarding, resumeExtraction, getPredata, completeRecruiterOnboarding, getAllIndianCities, getAllIndianStates, saveResume } = require('../../controllers/user/onBoardingController');
const multer = require('multer');
const router = express.Router();
const { protectRoute } = require('../../middleware/authMiddleware')
const upload = require('../../config/multer');
// const upload = multer({ dest: 'uploads/' });              



router.get("/predata",protectRoute,getPredata)
router.post("/complete-onboarding", protectRoute, completeOnboarding);
router.post("/saveResume",protectRoute,upload.single('resume'),saveResume);
router.post("/resume-extraction",protectRoute, upload.single('resume'), resumeExtraction);
router.get("/states",getAllIndianStates)
router.get("/:stateCode/cities",getAllIndianCities)

router.post("/complete-recruiter-onboarding",protectRoute,completeRecruiterOnboarding)


module.exports = router;

