const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const db = mongoose.connection;
const methodOverride = require('method-override')
const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const ejsMate = require('ejs-mate');  // Ejs mate is used for more functionality of ejs partials
// Ejs mate is used for more functionality of ejs partials
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')  //use for validations by defining schema
const { campgroundSchema, reviewSchema } = require('./joiSchemas')
const app = express();
const campgrounds = require('./routes/campground')
const reviews = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash');
const { networkInterfaces } = require('os');


app.engine('ejs', ejsMate);   //use ejs mate instead of ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuring static files
app.use(express.static(path.join(__dirname, '/public')))

//db connect
mongoose.connect('mongodb://localhost:27017/yelp-camp');
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database Connected');
});

//post request settings
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// configuring session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,   //for Security
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7, 
    }
}
app.use(session(sessionConfig))

//Setting flash
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})



// _______________________________________________________ ROUTE _____________________________________________________________
app.get('/', (req, res) => {
    res.render('home');
});
// --------------------------------------------------- Campgrounds Route -------------------------------------------------
app.use('/campgrounds', campgrounds)
// -------------------------------------------------- Reviews Route ------------------------------------------------------
app.use('/campgrounds/:id/reviews', reviews)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went wrong'
    req.flash('error', err.message)
    res.status(statusCode).redirect('/campgrounds')
    // res.status(statusCode).render('error', { err }); //For development

})

app.listen('8080', () => {
    console.log('Listening to the port 8080');
});