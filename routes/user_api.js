const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Student schema
const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  profilePhoto: String, // this matches your database field
});

// Model
const Student = mongoose.model('StudentList', studentSchema, 'users');

// POST /students
router.post('/', async (req, res) => {
  try {
    const students = await Student.find();
    const formatted = students.map(s => ({
      _id: s._id,
      imageUrl: s.profilePhoto || '',   // ✅ return as imageUrl, so Flutter understands
      fullName: s.firstName && s.lastName
        ? `${s.firstName} ${s.lastName}`.trim()
        : 'Unnamed Student'
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
