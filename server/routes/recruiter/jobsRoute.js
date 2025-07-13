const express = require("express");
const { protectRoute } = require("../../middleware/authMiddleware");
const {
  createJob,
  getAllJobs,
  getOrgLogo,
  getAllApplicants,
  initiateChatUser,
  jobGetMessages,
  sendMessage,
  deleteJob,
  updateJob,
  updateApplicationStatus,
  acceptApplication,
  rejectApplication,
  getApplicationStatus,
} = require("../../controllers/recruiter/jobsController");
const router = express.Router();

router.get("/", protectRoute, getAllJobs);
router.get("/getMessages/:conversationId", protectRoute, jobGetMessages);
router.get("/getOrgLogo", getOrgLogo);
router.post("/sendMessage", protectRoute, sendMessage);
router.post("/create", protectRoute, createJob);
router.get("/applicants", protectRoute, getAllApplicants);
router.post("/initiate", protectRoute, initiateChatUser);
router.delete("/:jobId", protectRoute, deleteJob);
router.put("/:jobId", protectRoute, updateJob);

// New routes for application management
router.post("/accept-application", protectRoute, acceptApplication);
router.post("/reject-application", protectRoute, rejectApplication);
router.post(
  "/update-application-status",
  protectRoute,
  updateApplicationStatus
);
router.get("/application-status", protectRoute, getApplicationStatus);

module.exports = router;
