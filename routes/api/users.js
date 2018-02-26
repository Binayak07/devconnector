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

module.exports = router;
