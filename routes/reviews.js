const express = require('express');
const router = express.Router({ mergeParams: true });
const path = require('path');
const Campground = require('../models/campgrounds');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const { reviewScehma } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
