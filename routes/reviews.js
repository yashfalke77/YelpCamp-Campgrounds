const express = require('express');
const router = express.Router({ mergeParams: true });  //access for reviews id in app.use in app.js file
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds');
const Review = require('../models/review');
const Joi = require('joi')
const { reviewSchema } = require('../joiSchemas')
const { validateReview, isLoggedIn, isReviewAuthors } = require('../middleware')




router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)

    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthors, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router;