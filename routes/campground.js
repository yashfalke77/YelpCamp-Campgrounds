const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds');
const Joi = require('joi')
const { campgroundSchema } = require('../joiSchemas')
const { isLoggedIn, isAuthors, validateCampground, } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')

// Multer is used to store / handle the file data(i.e. to handle multipart/form-data in html) : npm i multer
const multer = require('multer');
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })  //where to save to image


router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, catchAsync(campgrounds.renderNewForm));

router.post('/', isLoggedIn, upload.array('image'),validateCampground, catchAsync(campgrounds.newCampground) );

router.get('/:id', catchAsync(campgrounds.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthors, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthors, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthors, catchAsync(campgrounds.deleteCampground));

module.exports = router;