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
} = require("../../controllers/recruiter/jobsController");
const router = express.Router();

router.get("/", protectRoute, getAllJobs);
router.get("/getMessages/:conversationId", protectRoute, jobGetMessages);
router.get("/getOrgLogo", getOrgLogo);
router.post("/sendMessage", protectRoute, sendMessage);
router.post("/create", protectRoute, createJob);
router.get("/applicants", getAllApplicants);
router.post("/initiate", protectRoute, initiateChatUser);
router.delete("/:jobId", protectRoute, deleteJob);
router.put("/:jobId", protectRoute, updateJob);

module.exports = router;
