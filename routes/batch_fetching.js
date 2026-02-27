const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Schema: match your MongoDB document field names exactly
const Batch = mongoose.models.Batch || mongoose.model('Batch', new mongoose.Schema({
  studioId: mongoose.Schema.Types.ObjectId,
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  batchName: String,
  trainer: String,
  style: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DanceStyle'
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DanceLevel'
  },
  fee: String,
  capacity: Number,
  fromDate: String,
  toDate: String,
  days: [String],
  enrolled_students: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
}, { collection: 'batches' }));
;


// ✅ Route to fetch batches by branch_id
router.post('/byBranch', async (req, res) => {
  const { studioId, branchId } = req.body;

  if (!studioId || !branchId) {
    return res.status(400).json({ error: "studioId and branchId are required" });
  }

  try {
    const batches = await Batch.find({
      studioId,
      branch: branchId,
    })
      .populate('branch', 'name')     // get branch.name
      .populate('style', 'name')      // get style.name
      .populate('level', 'name');     // get level.name

    res.status(200).json(batches);
  } catch (err) {
    console.error("Error in /byBranch:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
