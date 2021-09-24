const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds');
const Joi = require('joi')
const { campgroundSchema } = require('../joiSchemas')
const { isLoggedIn, isAuthors, validateCampground, } = require('../middleware')



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    res.render('campgrounds/new')
}));

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author')
    if (!campground) {
        req.flash('error', 'Cannot Find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}));



router.get('/:id/edit', isLoggedIn, isAuthors, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot Find that Campground to Edit ')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}));

router.put('/:id', isLoggedIn, isAuthors, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true })
    req.flash('success', `Successfully updated ${campground.title} campground`)
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthors, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', `Successfully Deleted ${campground.title} campground`)
    res.redirect(`/campgrounds`)
}));

module.exports = router;