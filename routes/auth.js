
const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const { validateSignup } = require('../utils/validateSignup');
const { normalizeEmail, tokenPayload } = require('../utils/authHelpers');


// REGISTER ROUTE

router.post('/register', async (req, res) => {
  try {
    const result = validateSignup(req.body || {});

    // Validate email and password
    if (!result.ok) {
      return res.status(400).json({
        error: result.error
      });
    }

    // Normalize email
    const email = normalizeEmail(req.body.email);

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Save user in MongoDB
    const user = await User.create({
      email,
      password: hashedPassword
    });

    // Return safe user information
    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Register error:', err.message);

    // Handle duplicate email
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    return res.status(500).json({
      error: 'Server error'
    });
  }
});


// LOGIN ROUTE

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    // Find user
    const user = await User.findOne({ email });

    // Compare password
    const passwordOk =
      user && typeof password === 'string'
        ? await bcrypt.compare(password, user.password)
        : false;

    // Invalid login
    if (!user || !passwordOk) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      tokenPayload(user),
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and safe user information
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);

    return res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router;
