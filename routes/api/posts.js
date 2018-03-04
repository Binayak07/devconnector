const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('../../config/keys');

// Load Post Model
const Post = require('../../models/Post');

// @route   GET /api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find().then(posts => {
    res.json({ success: true, msg: 'Posts fetched', data: { posts } });
  });
});

// @route   GET /api/posts/:id
// @desc    Get single post with comments
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json({ success: true, msg: 'Post fetched', data: { post } });
    })
    .catch(err => res.json({ success: false, msg: 'No post found' }));
});

// @route   POST /api/posts
// @desc    Create post
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const newPost = new Post({
      text: req.body.text,
      user: req.user.id
    });

    newPost.save().then(post => {
      res.json({ success: true, msg: 'Post added', data: { post } });
    });
  }
);

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner before update
          if (post.user.toString() !== req.user.id) {
            return res.json({ success: false, msg: 'User unauthorized' });
          }

          // Get new text
          post.text = req.body.text;

          // Update
          post.save().then(post => {
            res.json({ success: true, msg: 'Post updated', data: { post } });
          });
        })
        .catch(err => res.json({ success: false, msg: 'No post found' }));
    });
  }
);

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner before the update
          if (post.user.toString() !== req.user.id) {
            return res.json({ success: false, msg: 'User unauthorized' });
          }

          // Delete
          post.remove().then(() => {
            res.json({ success: true, msg: 'Post removed' });
          });
        })
        .catch(err => res.json({ success: false, msg: 'No post found' }));
    });
  }
);

// @route   POST /api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res.json({
              success: false,
              msg: 'User already liked this post'
            });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          // Save
          post.save().then(() => {
            res.json({ success: true, msg: 'Post liked' });
          });
        })
        .catch(err => res.json({ success: false, msg: 'No post found' }));
    });
  }
);

// @route   POST /api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res.json({ success: false, msg: 'User has not liked' });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post
            .save()
            .then(() => res.json({ success: true, msg: 'Like removed' }));
        })
        .catch(err => res.json({ success: false, msg: 'No post found' }));
    });
  }
);

// @route   POST /api/posts/comment/:id
// @desc    Add a comment
// @access  Private

// @route   DELETE /api/posts/comment/:id
// @desc    Delete a comment
// @access  Private

module.exports = router;
