const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('../../config/keys');
const gravatar = require('gravatar');

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');

// @route   GET api/profile/user/current
// @desc    Get current users profile data
// @access  Private
router.get(
  '/user/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'email'])
      .then(profile => {
        if (!profile) {
          res.json({
            success: false,
            msg: 'There is no profile for this user'
          });
        }
        res.json({ success: true, data: { profile } });
      })
      .catch(err => res.json({ success: false, msg: err }));
  }
);

// @route   GET api/profile/all
// @desc    Get all users with a profile
// @access  Public
router.get('/all', (req, res) => {
  Profile.find()
    .populate('user', ['name', 'email'])
    .then(profiles => {
      res.json({ success: true, msg: 'Profiles found', data: { profiles } });
    })
    .catch(err => res.json({ success: false, msg: err }));
});

// @route   GET api/profile/user/:user_id
// @desc    Get user profile data by ID
// @access  Public
router.get('/user/:user_id', (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate('user', 'name')
    .then(profile => {
      if (profile) {
        return res.json({
          success: true,
          msg: 'Profile retrieved',
          data: { profile }
        });
      }
      res.json({ success: false, msg: 'There is no profile for this user' });
    })
    .catch(err => res.json({ success: false, msg: err }));
});

// @route   GET api/profile/handle/:handle
// @desc    Get user profile data by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate('user', 'name')
    .then(profile => {
      if (profile) {
        return res.json({
          success: true,
          msg: 'Profile retrieved',
          data: { profile }
        });
      } else {
        res.json({
          success: false,
          msg: 'There is no profile with that handle'
        });
      }
    });
});

// @route   POST api/profile
// @desc    Add or update user profile
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    // Get Fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
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
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    // Gravatar
    if (req.body.gravataremail) {
      profileFields.gravatarimg = gravatar.url(req.body.gravataremail, {
        s: '200', // size
        r: 'pg', // rating
        d: 'mm' // default
      });
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      // If Profile Exists
      if (profile) {
        // Update

        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => {
          res.json({
            success: true,
            msg: 'Profile updated',
            data: { profile }
          });
        });
      } else {
        // Save

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            return res.json({
              success: false,
              msg: 'That handle already exists'
            });
          }

          // Create profile
          new Profile(profileFields).save().then(profile => {
            res.json({
              success: true,
              msg: 'Profile created',
              data: { profile }
            });
          });
        });
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add Experience
// @access  Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then(profile => {
        res.json({ success: true, msg: 'Experience added', data: { profile } });
      });
    });
  }
);

// @route   POST api/profile/education
// @desc    Add Education
// @access  Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to edu array
      profile.education.unshift(newEdu);

      profile.save().then(profile => {
        res.json({ success: true, msg: 'Education added', data: { profile } });
      });
    });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete Experience
// @access  Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      // Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // Splice out of array
      profile.experience.splice(removeIndex, 1);

      // Save
      profile.save().then(profile => {
        res.json({
          success: true,
          msg: 'Experience removed',
          data: { profile }
        });
      });
    });
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete Education
// @access  Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      // Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // Splice out of array
      profile.education.splice(removeIndex, 1);

      // Save
      profile.save().then(profile => {
        res.json({
          success: true,
          msg: 'Education removed',
          data: { profile }
        });
      });
    });
  }
);

// @route   DELETE api/profile
// @desc    Delete Profile & User
// @access  Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOneAndRemove({
      user: req.user.id
    }).then(() => {
      User.findOneAndRemove({
        _id: req.user.id
      }).then(() => {
        res.json({
          success: true,
          msg: 'User removed'
        });
      });
    });
  }
);

// @route   POST api/profile/subscribe/:id
// @desc    Subscribe to profile
// @access  Private
router.post(
  '/subscribe/:profile_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findById(req.params.profile_id).then(profile => {
      // Check if is same user
      if (profile.user.toString() === req.user.id) {
        return res.json({
          success: false,
          msg: 'Can not subscribe to yourself'
        });
      }

      // Check if already subscribed
      if (
        profile.subscribers.filter(
          subscriber => subscriber.user.toString() === req.user.id
        ).length > 0
      ) {
        return res.json({
          success: false,
          msg: 'User already subscribed'
        });
      }

      // Add user id to subscribers array
      profile.subscribers.unshift({ user: req.user.id });

      // Save
      profile.save().then(() => {
        res.json({ success: true, msg: 'User subscribed' });
      });
    });
  }
);

// @route   POST /api/profile/unsubscribe/:profile_id
// @desc    Unsubscribe from user
// @access  Private
router.post(
  '/unsubscribe/:profile_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findById(req.params.profile_id).then(profile => {
      // Check if not subscribed
      if (
        profile.subscribers.filter(
          subscriber => subscriber.user.toString() === req.user.id
        ).length === 0
      ) {
        return res.json({ success: false, msg: 'User is not subscribed' });
      }

      // Get remove index
      const removeIndex = profile.subscribers
        .map(item => item.user.toString())
        .indexOf(req.user.id);

      // Splice out of array
      profile.subscribers.splice(removeIndex, 1);

      // Save
      profile
        .save()
        .then(() => res.json({ success: true, msg: 'User unsubscribed' }));
    });
  }
);

module.exports = router;
