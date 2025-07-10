const express = require("express");
const {
  getJobs,
  getEachJob,
  filterJobs,
  applyJob,
  toggleSaveJob,
  checkSave,
  getAppliedJobs,
  getSavedJobs,
  hideJob,
  unhideJob,
  getHiddenJobs,
} = require("../../controllers/user/jobsController");
const { protectRoute } = require("../../middleware/authMiddleware");
const router = express.Router();

// Add authentication middleware to getJobs so it can filter hidden jobs
router.get("/", protectRoute, getJobs);
router.post("/filters", protectRoute, filterJobs);

// Test route to check authentication
router.get("/test-auth", protectRoute, (req, res) => {
  res.json({
    message: "Authentication working!",
    user: {
      id: req.user._id,
      email: req.user.email,
    },
  });
});

router.post("/applyJob", protectRoute, applyJob);
router.post("/saveJob", protectRoute, toggleSaveJob);
router.get("/checkSave", protectRoute, checkSave);

router.get("/applied-jobs", protectRoute, getAppliedJobs);
router.get("/saved-jobs", protectRoute, getSavedJobs);

// Hide/Unhide job routes
router.post("/hide-job", protectRoute, hideJob);
router.post("/unhide-job", protectRoute, unhideJob);
router.get("/hidden-jobs", protectRoute, getHiddenJobs);

router.get("/:id", getEachJob);

module.exports = router;
