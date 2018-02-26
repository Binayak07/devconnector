const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Load User Model
const User = require('../../models/User');

// Test route
router.get('/', (req, res) => {
  res.json({ msg: 'Test' });
});

module.exports = router;
