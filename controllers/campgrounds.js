const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds');
const Category = require('../models/category');
const Joi = require('joi')
const { campgroundSchema } = require('../joiSchemas')
const { isLoggedIn, isAuthors, validateCampground, } = require('../middleware')
const cloudinary = require('cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxtoken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxtoken })


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',  { campgrounds })
}

module.exports.renderNewForm = async (req, res) => {
    const categories = await Category.find({})
    res.render('campgrounds/new', {categories})
}

module.exports.newCampground = async (req, res) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geodata.body.features[0].geometry
    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate({ path: 'category', populate: { path: 'title' } })
    .populate('author')
    if (!campground) {
        req.flash('error', 'Cannot Find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const categories = await Category.find({})
    const { id } = req.params
    const campground = await Campground.findById(id)
    .populate('category')
    if (!campground) {
        req.flash('error', 'Cannot Find that Campground to Edit ')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground, categories })
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.image.push(...imgs)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', `Successfully updated ${campground.title} campground`)
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', `Successfully Deleted ${campground.title} campground`)
    res.redirect(`/campgrounds`)
}