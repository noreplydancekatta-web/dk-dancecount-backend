const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// ✅ Inline City schema
const citySchema = new mongoose.Schema({
  name: String,
  state: String
}, { collection: 'cities' });

const City = mongoose.model('City', citySchema);

// ✅ Route to get cities by state using GET
router.get('/getCities', async (req, res) => {
  try {
    const state = req.query.state; // get state from query parameter
    const cities = await City.find({ state });
    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
