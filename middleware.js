const { campgroundSchema, reviewSchema, userSchema } = require('./joiSchemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campgrounds');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req user', req.user); //always constains whether user is present or not
    // console.log(req.path, req.originalUrl); //gives the last path you visited
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!!')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        // Since details is array of object
        console.log(error);
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthors = async (req, res, next) => {
    const { id } = req.params
    // Protecting this root only the owner can edit
    const campground = await Campground.findById(id)
    if (req.user && !campground.author.equals(req.user._id)) {
        req.flash('error', `You don't have authorization to edit ${campground.title}`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body)
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


module.exports.isReviewAuthors = async (req, res, next) => {
    const { id, reviewId } = req.params
    // Protecting this root only the owner can edit
    const review = await Review.findById(reviewId)
    if (req.user && !review.author.equals(req.user._id)) {
        req.flash('error', `You don't have authorization to delete review`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}