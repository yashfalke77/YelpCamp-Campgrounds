const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds');
const Joi = require('joi')
const { campgroundSchema } = require('../joiSchemas')
const { isLoggedIn, isAuthors, validateCampground, } = require('../middleware')
const campgrounds  = require('../controllers/campgrounds')



router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, catchAsync(campgrounds.renderNewForm));

router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.newCampground));

router.get('/:id', catchAsync(campgrounds.showCampground));



router.get('/:id/edit', isLoggedIn, isAuthors, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthors, validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthors, catchAsync(campgrounds.deleteCampground));

module.exports = router;