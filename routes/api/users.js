const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

// Load User Model
const User = require('../../models/User');

// Register
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      res.json({ success: false, msg: 'Email already exists' });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              // Create user data to send with response
              const registeredUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                date: user.date
              };

              res.json({
                success: true,
                msg: 'You are now registered',
                data: { user: registeredUser }
              });
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// Login
router.post('/login', (req, res, next) => {
  // Get values from body
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email })
    .then(user => {
      // Check for user
      if (!user) {
        // Respond with no user
        return res.json({ success: false, msg: 'User not found' });
      }

      // Check Password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // Password Matched
          const payload = { id: user.id }; // Create payload

          // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 604800 }, // Expires in 1 week
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token,
                user: {
                  id: user._id,
                  name: user.name,
                  email: user.email
                }
              });
            }
          );
        } else {
          return res.json({ success: false, msg: 'Password incorrect' });
        }
      });
    })
    .catch(err => res.json({ success: false, msg: err }));
});

// Get Current User - Protected
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
