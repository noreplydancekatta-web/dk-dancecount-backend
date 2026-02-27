const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Branch = mongoose.models.Branch || mongoose.model('Branch', new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, default: "" },
  image: { type: String, default: "" },
  studioId: { type: String, required: true },
}));

// ✅ GET /api/branches/list?studioId=xxxx — fetch branches for a studio
router.get('/list', async (req, res) => {
  try {
    const { studioId } = req.query;

    if (!studioId) {
      return res.status(400).json({ error: "studioId is required" });
    }

    const branches = await Branch.find({ studioId }).lean();

    if (!branches || branches.length === 0) {
      return res.status(404).json({ error: "No branches found for this studio" });
    }

    res.status(200).json(branches);
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ GET /api/branches/cities?studioId=xxxx — fetch city counts for a studio
router.get('/cities', async (req, res) => {
  try {
    const { studioId } = req.query;

    if (!studioId) {
      return res.status(400).json({ error: "studioId is required" });
    }

    const cities = await Branch.aggregate([
      {
        $match: {
          studioId,
          city: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $addFields: {
          cleanedCity: { $trim: { input: { $toLower: "$city" } } }
        }
      },
      {
        $group: {
          _id: "$cleanedCity",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          city: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { city: 1 } }
    ]);

    res.status(200).json(cities);
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
