const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Studio = require('../models/Studio');
const multer = require('multer');
const path = require('path');

// ✅ Dynamic storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'studios'; // default folder

    if (req.uploadType === 'aadhar') {
      folder = 'aadhar';
    } else if (req.uploadType === 'logo') {
      folder = 'logos';
    } else if (req.uploadType === 'studios') {
      folder = 'studios';
    } else if (req.uploadType === 'profile-pictures') {
      folder = 'profile-pictures';
    }

    cb(null, `/var/www/uploads/${folder}`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


// Middleware to set uploadType before multer runs
function setUploadType(type) {
  return (req, res, next) => {
    req.uploadType = type;
    next();
  };
}

const upload = multer({ storage });


// ✅ Upload Logo
router.post('/upload-logo', setUploadType('logo'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/logos/${req.file.filename}` });
});

// ✅ Upload Aadhar (front or back)
router.post('/upload-aadhar', setUploadType('aadhar'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/aadhar/${req.file.filename}` });   // <-- FIXED
});

// ✅ Upload Studio Photos
router.post('/upload-studios', setUploadType('studios'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/studios/${req.file.filename}` });   // <-- FIXED
});

// ✅ Upload Profile Picture
router.post('/upload-profile', setUploadType('profile-pictures'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/profile-pictures/${req.file.filename}` });
});


// ✅ GET /api/studios/:id — Get studio by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Studio ID' });
  }

  try {
    const studio = await Studio.findById(id);
    if (!studio) return res.status(404).json({ error: 'Studio not found' });
    res.json(studio);
  } catch (err) {
    console.error('❌ Error fetching studio:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ PUT /api/studios/:id — Update studio details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Studio ID' });
  }

  try {
    const updatedStudio = await Studio.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedStudio) return res.status(404).json({ message: 'Studio not found' });

    res.status(200).json({
      message: 'Studio updated successfully',
      studio: updatedStudio
    });
  } catch (err) {
    console.error('❌ Error updating studio:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
