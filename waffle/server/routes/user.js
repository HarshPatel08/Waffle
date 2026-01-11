const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users (for group member selection)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'name email emoji');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
