const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Batch schema (same as your existing one)
const batchSchema = new mongoose.Schema({
  batchName: String,
  trainer: String,
  branch: String,
  style: String,
  level: String,
  fee: String,
  capacity: String,
  fromDate: String,
  toDate: String,
  startTime: String,
  endTime: String,
  days: [String],
  enrolled_students: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
}, { collection: 'batches' });

const Batch = mongoose.models.Batch || mongoose.model('Batch', batchSchema);

// ✅ GET /batchdetails?id=xxxx - Get a single batch by ID
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.status(200).json(batch);
  } catch (err) {
    console.error('❌ Error fetching batch details:', err);
    res.status(500).json({ error: 'Failed to fetch batch details' });
  }
});

module.exports = router;
