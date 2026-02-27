const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DanceLevel = mongoose.models.DanceLevel || mongoose.model(
  'DanceLevel',
  new mongoose.Schema({ name: String }),
  'levels'
);

const Style = mongoose.models.Style || mongoose.model(
  'Style',
  new mongoose.Schema({ name: String }),
  'dancestyles'
);

const Student = mongoose.models['StudentDetail'] || mongoose.model(
  'StudentDetail',
  new mongoose.Schema({
    name: String,
    imageUrl: String,
    mobile: String,
    alternateMobile: String,
    dateOfBirth: String,
    email: String,
    address: {
      house: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    isProfessional: String,
    experience: String,
    youtube: String,
    facebook: String,
    instagram: String,
    skills: [String],
    enrolled_batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  }),
  'users'
);

const Batch = mongoose.models['Batch'] || mongoose.model(
  'Batch',
  new mongoose.Schema({
    batchName: String,
    startTime: String,
    endTime: String,
    days: [String],
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    style: { type: mongoose.Schema.Types.ObjectId, ref: 'Style' },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'DanceLevel' },
  }),
  'batches'
);

// ✅ GET /studentdetails?id=student_id
router.get('/', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'Student ID is required' });

  try {
    const student = await Student.findById(id)
      .populate({
        path: 'enrolled_batches',
        populate: [
          { path: 'branch', select: 'name' },
          { path: 'style', select: 'name' },
          { path: 'level', select: 'name' },
        ]
      })
      .lean();

    if (!student) return res.status(404).send('Student not found');

    const enrichedBatches = (student.enrolled_batches || []).map(batch => ({
      batchName: batch.batchName,
      startTime: batch.startTime,
      endTime: batch.endTime,
      days: batch.days,
      branch: batch.branch?.name || '-',
      style: batch.style?.name || '-',
      level: batch.level?.name || '-',
    }));

    res.json({
      ...student,
      enrolled_batches: enrichedBatches,
    });
  } catch (err) {
    console.error('❌ Error fetching student details:', err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
