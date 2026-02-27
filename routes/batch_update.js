// Add this inside routes/Batch.js or a separate file like update_batch.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ✅ Get or define the Batch model
const Batch = mongoose.models.Batch || mongoose.model(
  'Batch',
  new mongoose.Schema({
    batchName: String,
    trainer: String,
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    style: { type: mongoose.Schema.Types.ObjectId, ref: 'Style' },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' },

    studioId: mongoose.Schema.Types.ObjectId,
    fee: String,
    capacity: String,
    startTime: String,
    endTime: String,
    fromDate: String,
    toDate: String,
    days: [String],
    enrolled_students: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  }, { timestamps: true, collection: 'batches' })
);

// ✅ POST /api/updatebatch → Update batch by ID
router.post('/updatebatch', async (req, res) => {
  try {
    const {
      batchId,
      batchName,
      trainer,
      branch,
      style,
      level,
      fee,
      capacity,
      startTime,
      endTime,
      fromDate,
      toDate,
      days,
    } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: 'batchId is required' });
    }

    // 🔍 Step 1: Get existing batch
    const existingBatch = await Batch.findById(batchId);
    if (!existingBatch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const enrolledCount = existingBatch.enrolled_students.length;
    const newCapacity = parseInt(capacity, 10);

    // ❌ Prevent if new capacity is less than enrolled
    if (newCapacity < enrolledCount) {
      return res.status(400).json({
        message: `Capacity cannot be less than enrolled students (${enrolledCount})`,
      });
    }

    // ✅ Step 2: Proceed to update
    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      {
        batchName,
        trainer,
        branch: new mongoose.Types.ObjectId(branch),
        style: new mongoose.Types.ObjectId(style),
        level: new mongoose.Types.ObjectId(level),
        fee,
        capacity,
        startTime,
        endTime,
        fromDate,
        toDate,
        days,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Batch updated successfully',
      batch: updatedBatch,
    });
  } catch (error) {
    console.error('❌ Error updating batch:', error);
    res.status(500).json({
      message: 'Failed to update batch',
      error: error.message,
    });
  }
});

module.exports = router;
