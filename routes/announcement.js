const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const timeago = require('timeago.js'); // ✅ Fix

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

// ✅ Add announcement
router.post('/', async (req, res) => {
  try {
    const { title, message } = req.body;

    const newAnnouncement = new Announcement({ title, message });
    await newAnnouncement.save();

    res.status(201).json({ message: '✅ Announcement added successfully' });
  } catch (error) {
    console.error('❌ Error saving announcement:', error);
    res.status(500).json({ message: 'Failed to add announcement' });
  }
});

// ✅ Get announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });

    const enriched = announcements.map(ann => ({
  title: ann.title,
  message: ann.message,
  createdAt: ann.createdAt  // ✅ Send raw timestamp
}));


    res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ Failed to get announcements:', err);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

module.exports = router;
