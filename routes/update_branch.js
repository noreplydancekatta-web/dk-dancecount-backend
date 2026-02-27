const express = require('express');
const router = express.Router();
const Branch = require('../models/branch');
const multer = require('multer');
const path = require('path');

// ✅ Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/uploads/branches'); // folder where files go
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ PUT route to update a branch (with optional image upload)
router.post('/updateBranch', upload.single('image'), async (req, res) => {
  try {
    const {
      _id,
      name,
      address,
      pincode,
      area,
      mapLink,
      country,
      state,
      city,
      contactNo
    } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    const updateData = {
      name,
      address,
      pincode,
      area,
      mapLink,
      country,
      state,
      city,
      contactNo
    };

    // ✅ if file uploaded, add imageUrl to updateData
    if (req.file) {
      updateData.image = '/uploads/branches/' + req.file.filename;
    }

    const updated = await Branch.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.status(200).json({ message: 'Branch updated successfully', branch: updated });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
