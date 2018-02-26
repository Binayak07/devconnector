const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

const users = require('./routes/api/users');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to mongoose
mongoose
  .connect('mongodb://brad:brad@ds245518.mlab.com:45518/sharesocial')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Use routes
app.use('/api/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
