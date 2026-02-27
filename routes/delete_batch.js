// ✅ Add this inside routes/batch.js or another route file
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ✅ Define or reuse Batch model
const Batch = mongoose.models.Batch || mongoose.model(
  'Batch',
  new mongoose.Schema({
    batchName: String,
    trainer: String,
    branch: String,
    style: String,
    level: String,
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

// ✅ POST /api/deletebatch → Delete only if no students enrolled
router.post('/deletebatch', async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: 'batchId is required' });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const enrolledCount = batch.enrolled_students.length;

    if (enrolledCount > 0) {
      return res.status(400).json({
        message: `Cannot delete batch. ${enrolledCount} student(s) are enrolled.`,
      });
    }

    await Batch.findByIdAndDelete(batchId);

    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting batch:', error);
    res.status(500).json({
      message: 'Failed to delete batch',
      error: error.message,
    });
  }
});

module.exports = router;
