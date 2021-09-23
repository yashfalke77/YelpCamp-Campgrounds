const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const db = mongoose.connection;
const methodOverride = require('method-override')
const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const User = require('./models/user')
const ejsMate = require('ejs-mate');  // Ejs mate is used for more functionality of ejs partials
// Ejs mate is used for more functionality of ejs partials
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')  //use for validations by defining schema
const { campgroundSchema, reviewSchema } = require('./joiSchemas')
const app = express();
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const session = require('express-session')
const flash = require('connect-flash');
const { networkInterfaces } = require('os');
const passport = require('passport');
const localStrategy = require('passport-local')


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



// For Authentication we use: npm i passport passport-local passport-local-mongoose
app.use(passport.initialize())
app.use(passport.session())  //always passport.session must be after session
passport.use(new localStrategy(User.authenticate()))  //use the local startegy with user model and authenticate functin which is created by passport local mongoose

passport.serializeUser(User.serializeUser()) //how to store it
passport.deserializeUser(User.deserializeUser()) // how to unstore it in sesion

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

//Setting flash
app.use(flash())

app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



// _______________________________________________________ ROUTE _____________________________________________________________
app.get('/', (req, res) => {
    res.render('home');
});
// --------------------------------------------------- Campgrounds Route -------------------------------------------------
app.use('/campgrounds', campgroundRoutes)
// -------------------------------------------------- Reviews Route ------------------------------------------------------
app.use('/campgrounds/:id/reviews', reviewRoutes)
// --------------------------------------------------- AUTH routes -----------------------------------------------------
app.use('/', userRoutes)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went wrong'
    // req.flash('error', err.message)
    // res.status(statusCode).redirect('/campgrounds')
    res.status(statusCode).render('error', { err }); //For development

})

app.listen('8080', () => {
    console.log('Listening to the port 8080');
});