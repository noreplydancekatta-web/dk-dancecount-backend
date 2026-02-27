const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Branch = mongoose.models.Branch || mongoose.model('Branch', require('../models/branch'));


// Import your Branch model

// ✅ GET branch by ID
router.get('/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;

    if (!branchId) {
      return res.status(400).json({ message: 'branchId is required' });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(branch);
  } catch (error) {
    console.error('❌ Error fetching branch by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
