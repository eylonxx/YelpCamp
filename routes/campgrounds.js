const express = require('express');
const router = express.Router();
const Campground = require('../models/campgrounds');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const campgrounds = require('../controllers/campgrounds'); //controller functions, access as campground.xxx

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.post(
  '/',
  validateCampground,
  isLoggedIn,
  catchAsync(campgrounds.createCampground)
);

router.get('/:id', catchAsync(campgrounds.showCampground));

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditCampground)
);

router.put(
  '/:id',
  validateCampground,
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.updateCampground)
);

router.delete('/:id', isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
