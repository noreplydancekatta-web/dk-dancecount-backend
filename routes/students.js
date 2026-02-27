const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Student = mongoose.models.Student || mongoose.model('Student', new mongoose.Schema({
  firstName: String,
  lastName: String,
  imageUrl: String,
}, { collection: 'users' }));

const Batch = mongoose.models.Batch || mongoose.model('Batch', new mongoose.Schema({
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
  studioId: String,
  enrolled_students: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
}, { collection: 'batches' }));

// ✅ Changed POST to GET
router.get('/', async (req, res) => {
  const { studioId } = req.query;

  if (!studioId) {
    return res.status(400).json({ error: 'studioId is required' });
  }

  try {
    // ✅ Only fetch batches that have enrolled students
    const batches = await Batch.find({
      studioId,
      enrolled_students: { $exists: true, $not: { $size: 0 } }
    });

    const now = new Date();

    const activeStudentIds = new Set();
    const inactiveStudentIds = new Set();

    batches.forEach(batch => {
      const isActive = new Date(batch.toDate) >= now;

      if (Array.isArray(batch.enrolled_students)) {
        batch.enrolled_students.forEach(studentId => {
          const idStr = studentId.toString();
          if (isActive) {
            activeStudentIds.add(idStr);
          } else {
            inactiveStudentIds.add(idStr);
          }
        });
      }
    });

    const allStudentIds = Array.from(new Set([...activeStudentIds, ...inactiveStudentIds]));

    if (allStudentIds.length === 0) {
      return res.json([]); // No students enrolled
    }

    const students = await Student.find({ _id: { $in: allStudentIds } });

    const studentList = students.map(s => {
      const idStr = s._id.toString();
      const status = activeStudentIds.has(idStr) ? 'active' : 'inactive';
      return {
        _id: s._id,
        fullName: `${s.firstName} ${s.lastName}`,
        imageUrl: s.imageUrl || '',
        status
      };
    });

    res.json(studentList);
  } catch (err) {
    console.error('❌ Error fetching students:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
