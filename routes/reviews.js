const express = require('express');
const router = express.Router({ mergeParams: true });  //access for reviews id in app.use in app.js file
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds');
const Review = require('../models/review');
const Joi = require('joi')
const { reviewSchema } = require('../joiSchemas')
const { validateReview, isLoggedIn, isReviewAuthors } = require('../middleware')
const reviews = require('../controllers/reviews')



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthors, catchAsync(reviews.deleteReview))


module.exports = router;