const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer setup: save files to VPS folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/var/www/uploads/branches'); // <-- VPS folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Make VPS folder public
const app = express();
app.use('/uploads', express.static('/var/www/uploads'));

// Branch schema
const branchSchema = new mongoose.Schema({
  name: String,
  address: String,
  pincode: String,
  area: String,
  mapLink: String,
  country: String,
  state: String,
  city: String,
  image: String,
  contactNo: String,
  studioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Studio', required: true }
}, { collection: 'branches' });

const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);

// Route
router.post('/createBranch', upload.single('image'), async (req, res) => {
  try {
    const newBranch = new Branch({
      name: req.body.name,
      address: req.body.address,
      contactNo: req.body.contactNo,
      pincode: req.body.pincode,
      area: req.body.area,
      mapLink: req.body.mapLink,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      studioId: req.body.studioId,
      image: req.file ? '/uploads/branches/' + req.file.filename : null // update path
    });
    await newBranch.save();
    res.status(200).send('Branch Created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating branch');
  }
});

module.exports = router;
