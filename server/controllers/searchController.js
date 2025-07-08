const Job = require("../models/recruiter/Job");
const BusinessProfile = require("../models/recruiter/BusinessProfile");
const User = require("../models/user/User");

exports.search = async (req, res) => {
  try {
    const { query = "", category = "Jobs", page = 1, limit = 10 } = req.body;
    console.log("[SEARCH] Incoming query:", { query, category, page, limit });
    const regex = new RegExp(query, "i"); // case-insensitive
    let results = [];
    let total = 0;

    if (!query.trim()) {
      console.log("[SEARCH] Empty query string");
      return res.json({ results: [], total: 0, page, limit });
    }

    switch (category) {
      case "Jobs": {
        const filter = { $text: { $search: query } };
        total = await Job.countDocuments(filter);
        results = await Job.find(filter, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
        console.log(`[SEARCH] Jobs found: ${results.length} / ${total}`);
        break;
      }
      case "Companies": {
        const filter = { $text: { $search: query } };
        total = await BusinessProfile.countDocuments(filter);
        results = await BusinessProfile.find(filter, {
          score: { $meta: "textScore" },
        })
          .sort({ score: { $meta: "textScore" } })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
        console.log(`[SEARCH] Companies found: ${results.length} / ${total}`);
        break;
      }
      case "Peoples": {
        const filter = { $text: { $search: query } };
        total = await User.countDocuments(filter);
        results = await User.find(filter, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();
        console.log(`[SEARCH] Peoples found: ${results.length} / ${total}`);
        break;
      }
      default:
        console.log("[SEARCH] Invalid category:", category);
        return res.status(400).json({ error: "Invalid category" });
    }

    res.json({ results, total, page, limit });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
