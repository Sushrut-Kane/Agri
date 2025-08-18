const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      location
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        name: user.name,
        email: user.email,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register user' 
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to login' 
    });
  }
});

module.exports = router;