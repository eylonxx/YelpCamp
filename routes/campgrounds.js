const express = require('express');
const router = express.Router();
const Campground = require('../models/campgrounds');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const campgrounds = require('../controllers/campgrounds'); //controller functions, access as campground.xxx

router
  .route('/')
  .get(catchAsync(campgrounds.index))
  .post(
    validateCampground,
    isLoggedIn,
    catchAsync(campgrounds.createCampground)
  );

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
  .route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(
    validateCampground,
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditCampground)
);

module.exports = router;
