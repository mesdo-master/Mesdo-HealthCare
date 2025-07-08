const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// POST /api/search
router.post("/", searchController.search);

module.exports = router;
