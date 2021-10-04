if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

// Here process.env.NODE_ENV is envoirnment variable  and doing it development mode only 
// Because in production there is diiferent way to do it

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
const categoryRoutes = require('./routes/category')
const session = require('express-session')
const mongoStore = require('connect-mongo') //to store session in cloud : npm i connect-mongo
const flash = require('connect-flash');
const { networkInterfaces } = require('os');
const passport = require('passport');
const localStrategy = require('passport-local')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxtoken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxtoken })
// Mongo sql injection
const mongoSanitize = require('express-mongo-sanitize');
// Helmet.js is a Node.js module that helps in securing HTTP headers. It is implemented in express applications. Therefore, we can say that helmet.js helps in securing express applications
const helmet = require('helmet');

// npm i express-mongo-sanitize
app.use(mongoSanitize())   //it will not allow keywords through query strings or params like $gt

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

//db connect
mongoose.connect(dbUrl);
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database Connected');
});

app.engine('ejs', ejsMate);   //use ejs mate instead of ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//post request settings
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Configuring static files
app.use(express.static(path.join(__dirname, '/public')))

// configuring session
const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = mongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret,
    },
    touchAfter: 24 * 3600
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = { 
    name: 'session',  //changing the name of session
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,   //for Security can't access cookie through js
        // secure: true,     // enable https session security but it will affect our develpmemnt server, use while hoisting only
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store,
}

app.use(session(sessionConfig))

//Setting flash
app.use(flash())

// Helmet : npm i helmet (Makes app more scure)
app.use(helmet()) //(using these it installs all functions issue with content security policy)

// ---------------------------- Content security ----------------------------------------------------
// It decides whter what is allowed and what is not 
// For eg fonts sources, icons sources, image sources what are allowed what are not allowed
const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    // "https://kit.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    // "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com",
    // "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhbiouaym/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// For Authentication we use: npm i passport passport-local passport-local-mongoose
app.use(passport.initialize())
app.use(passport.session())  //always passport.session must be after session
passport.use(new localStrategy(User.authenticate()))  //use the local startegy with user model and authenticate functin which is created by passport local mongoose

passport.serializeUser(User.serializeUser()) //how to store it
passport.deserializeUser(User.deserializeUser()) // how to unstore it in sesion


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
// ---------------------------------------------------- category routes -----------------------------------------------
app.use('/c', categoryRoutes)
// -------------------------------------------------------- about us -------------------------------------------------------------
app.get('/about', (req, res) => {
    res.render('about.ejs')
})

app.get('/results', async(req, res) =>{
    const {search_query} = req.query
    const campgrounds = await Campground.find( {title: {$regex: search_query, $options: "i"} })
    res.render('search.ejs', {campgrounds, search_query})
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})


// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err }); //For development
})

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});