const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// ✅ Define schema only if not already registered
const Batch = mongoose.models.Batch || mongoose.model(
  'Batch',
  new mongoose.Schema({
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Studio',
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    batchName: { type: String, required: true },
    trainer: { type: String, default: "" },
    style: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DanceStyle',
      required: true
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DanceLevel',
      required: true
    },
    fee: { type: String, required: true },
    capacity: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    days: [{ type: String }],
    enrolled_students: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: []
    }
  }, { timestamps: true, collection: 'batches' })
);

// ✅ GET /api/batches/batches?studioId=xxxx
router.get('/', async (req, res) => {
  try {
    const { studioId } = req.query;
    if (!studioId) {
      return res.status(400).json({ message: 'studioId is required' });
    }

    const batches = await Batch.find({ studioId })
      .populate('style', 'name')
      .populate('level', 'name')
      .populate('branch', 'name area city');

    res.status(200).json(batches);
  } catch (error) {
    console.error('❌ Error fetching batches:', error);
    res.status(500).json({ message: 'Failed to fetch batches' });
  }
});

module.exports = router;
