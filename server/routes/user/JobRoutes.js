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
} = require("../../controllers/user/jobsController");
const { protectRoute } = require("../../middleware/authMiddleware");
const router = express.Router();

router.get("/", getJobs);
router.post("/filters", filterJobs);

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

router.get("/:id", getEachJob);

module.exports = router;
