// routes/state_api.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: String,
  country: String
}, { collection: 'states' });

const State = mongoose.model('State', stateSchema);

// ✅ Change to GET
router.get('/getStates', async (req, res) => {
  try {
    const country = req.query.country; // get country from query parameter
    const states = await State.find({ country });
    res.json(states);
  } catch (err) {
    res.status(500).send('Error fetching states');
  }
});

module.exports = router;
