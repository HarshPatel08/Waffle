const express = require('express');
const User = require('../models/User');
const { checkProfanity } = require('../utils/profanityFilter');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, emoji } = req.body;
    console.log('[SIGNUP] Request received:', { name, email, hasPassword: !!password });

    // Validate required fields
    if (!name || !email || !password) {
      console.log('[SIGNUP] Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check name for profanity
    console.log('[SIGNUP] Checking profanity...');
    const profanityCheck = checkProfanity(name);
    if (!profanityCheck.isClean) {
      return res.status(400).json({
        success: false,
        message: profanityCheck.reason,
      });
    }

    // Validate password length (8-16 characters)
    if (password.length < 8 || password.length > 16) {
      console.log('[SIGNUP] Password length invalid:', password.length);
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 16 characters',
      });
    }

    // Check if user already exists
    console.log('[SIGNUP] Checking for existing user...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    console.log('[SIGNUP] Existing user check done:', !!existingUser);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create new user
    console.log('[SIGNUP] Creating user...');
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      emoji: emoji || '😊',
    });
    console.log('[SIGNUP] User created:', user._id);

    // Return user without password
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emoji: user.emoji,
      },
    });
  } catch (error) {
    console.error('[SIGNUP] Error:', error.message);
    console.error('[SIGNUP] Full error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again.',
    });
  }
});

// @route   POST /api/auth/signin
// @desc    Authenticate user & get token
// @access  Public
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Return user without password
    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emoji: user.emoji,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

module.exports = router;
