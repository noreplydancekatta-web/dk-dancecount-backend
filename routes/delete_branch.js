const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Branch model
const Branch = mongoose.models.Branch || mongoose.model('Branch', require('../models/branch'));

// Define Batch model (same schema)
const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true, trim: true },
  trainer: { type: String, default: "", trim: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  style: { type: mongoose.Schema.Types.ObjectId, ref: 'Style' },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' },
  studioId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Studio' },
  enrolled_students: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  fee: { type: String, required: true, trim: true },
  capacity: { type: String, required: true, trim: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  fromDate: { type: String, required: true, trim: true },
  toDate: { type: String, required: true, trim: true },
  days: [{ type: String, trim: true }]
}, {
  timestamps: true,
  strict: 'throw',
  versionKey: false
});

const Batch = mongoose.models.Batch || mongoose.model('Batch', batchSchema);

// ✅ Route to delete branch
router.post('/deleteBranch', async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'Branch _id is required' });
    }

    const branch = await Branch.findById(_id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const batches = await Batch.find({ branch: _id });

    const now = new Date();

    const hasActiveEnrolledBatch = batches.some(batch => {
      const toDate = new Date(batch.toDate); // Convert to actual Date
      const isActive = toDate >= now;
      const hasStudents = Array.isArray(batch.enrolled_students) && batch.enrolled_students.length > 0;
      return isActive && hasStudents;
    });

    if (hasActiveEnrolledBatch) {
      return res.status(400).json({
        message: 'Branch cannot be deleted. There are active batches with enrolled students.'
      });
    }

    await Branch.findByIdAndDelete(_id);

    res.status(200).json({ message: 'Branch deleted successfully' });

  } catch (error) {
    console.error('Delete Branch Error:', error);
    res.status(500).json({ message: 'Server error while deleting branch' });
  }
});

module.exports = router;
