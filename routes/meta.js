// meta.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Branch = mongoose.models.Branch || mongoose.model('Branch', new mongoose.Schema({
  name: String,
  city: String,
  area: String,
  imageUrl: String,
  studioId: String,
}));

const DanceStyle = mongoose.models.DanceStyle || mongoose.model('DanceStyle', new mongoose.Schema({
  name: String,
}));

const Level = mongoose.models.Level || mongoose.model('Level', new mongoose.Schema({
  name: String,
}));

// ✅ Changed POST to GET, get studioId from query parameter
router.get('/meta', async (req, res) => {
  try {
    const studioId = req.query.studioId;

    if (!studioId) {
      return res.status(400).json({ message: 'studioId is required' });
    }

    const branches = await Branch.find(
      { studioId },
      { _id: 1, name: 1, area: 1, city: 1 }
    );

    const styles = await DanceStyle.find({}, { _id: 1, name: 1 });
    const levels = await Level.find({}, { _id: 1, name: 1 });

    res.status(200).json({ branches, styles, levels });
  } catch (error) {
    console.error("❌ Error fetching meta:", error);
    res.status(500).json({ message: 'Failed to fetch dropdown data' });
  }
});

module.exports = router;
