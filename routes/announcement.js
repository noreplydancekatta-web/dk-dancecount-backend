const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { format } = require('timeago.js'); // ✅ timeago for human-readable timestamps

// ✅ Announcement schema with batch
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  batch: { type: String, required: true }, // batch field
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

// ✅ Add a new announcement
router.post('/', async (req, res) => {
  try {
    const { title, message, batch } = req.body;

    if (!title || !message || !batch) {
      return res.status(400).json({ message: 'Title, message, and batch are required' });
    }

    const newAnnouncement = new Announcement({ title, message, batch });
    await newAnnouncement.save();

    res.status(201).json({ message: '✅ Announcement added successfully' });
  } catch (error) {
    console.error('❌ Error saving announcement:', error);
    res.status(500).json({ message: 'Failed to add announcement' });
  }
});

// ✅ Get announcements for a specific batch
router.get('/', async (req, res) => {
  try {
    const { batch } = req.query; // frontend should send ?batch=<batchName>
    if (!batch) {
      return res.status(400).json({ message: 'Batch is required' });
    }

    // Get announcements only for this batch
    const announcements = await Announcement.find({ batch }).sort({ createdAt: -1 });

    // Enrich with timeago
    const enriched = announcements.map(ann => ({
      title: ann.title,
      message: ann.message,
      createdAt: ann.createdAt,
      timeAgo: format(ann.createdAt) // human-friendly
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ Failed to get announcements:', err);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

module.exports = router;