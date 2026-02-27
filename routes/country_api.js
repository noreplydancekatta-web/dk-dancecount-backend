// routes/country_api.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: String
}, { collection: 'countries' });

const Country = mongoose.model('Country', countrySchema);

// ✅ define GET /getCountries
router.get('/getCountries', async (req, res) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching countries');
  }
});

module.exports = router;
