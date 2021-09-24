const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds');
const Joi = require('joi')
const { campgroundSchema } = require('../joiSchemas')
const { isLoggedIn, isAuthors, validateCampground, } = require('../middleware')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new')
}

module.exports.newCampground = async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author')
    if (!campground) {
        req.flash('error', 'Cannot Find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot Find that Campground to Edit ')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true })
    req.flash('success', `Successfully updated ${campground.title} campground`)
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', `Successfully Deleted ${campground.title} campground`)
    res.redirect(`/campgrounds`)
}