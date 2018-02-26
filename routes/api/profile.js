const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('../../config/keys');
const gravatar = require('gravatar');

// Load User Model
const Profile = require('../../models/Profile');

// POST /profile [Add or Update Main Profile Fields (Private)]
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    // Get Fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.age) profileFields.age = req.body.age;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Split into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }
    // Social
    profileFields.social = {};
    if (req.body.website) profileFields.social.website = req.body.website;
    if (req.body.youtube) profileFields.social.youtube = req.body.website;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    // Gravatar
    if (req.body.gravataremail) {
      profileFields.gravatarimg = gravatar.url(req.body.gravataremail, {
        s: '200',
        r: 'pg',
        d: '404'
      });
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // If Profile Exists
        if (profile) {
          // Update

          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          ).then(profile => {
            res.json({ success: true, msg: 'Profile updated', profile });
          });
        } else {
          // Save

          new Profile(profileFields)
            .save()
            .then(profile => {
              res.json({ success: true, msg: 'Profile created', profile });
            })
            .catch(err =>
              res.json({ success: false, msg: err.errors.status.message })
            );
        }
      })
      .catch(err => res.json({ success: false, msg: err }));
  }
);

// GET /profile [Get User Profile (Public)]
router.get('/user/:user_id', (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate('user')
    .then(fields => {
      // Return Custom Profile Response
      const profile = {
        name: fields.user.name,
        age: fields.age,
        location: fields.location,
        status: fields.status,
        skills: fields.skills,
        bio: fields.bio,
        githubusername: fields.githubusername,
        experience: fields.experience,
        education: fields.education,
        social: fields.social
      };
      res.json({ success: true, profile });
    })
    .catch(err =>
      res.json({ success: false, msg: 'There is no profile for this user' })
    );
});

// POST /profile/experience [Add Experience (Private)]
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.title,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then(profile => {
        res.json({ success: true, msg: 'Experience added', profile });
      });
    });
  }
);

module.exports = router;
