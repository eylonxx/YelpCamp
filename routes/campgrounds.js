const express = require('express');
const router = express.Router();
const Campground = require('../models/campgrounds');
const multer = require('multer'); //works witH express, uploads
const { storage } = require('../cloudinary');
const upload = multer({ storage }); //use storage from cloudinary instead of default, from multer-storage-cloudinary package

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const campgrounds = require('../controllers/campgrounds'); //controller functions, access as campground.xxx

router.route('/').get(catchAsync(campgrounds.index)).post(
  isLoggedIn,
  upload.array('image'), //multer middleware
  validateCampground,
  catchAsync(campgrounds.createCampground)
);
//image from form, name=image
//upload.single allows us to view req.file for info about file uploaded

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
