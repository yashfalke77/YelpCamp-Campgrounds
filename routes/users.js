const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { route } = require('./campground');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const isLoggedIn = require('../middleware')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body.user
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {    //doesnt support await , here after account creation you are directly loggged in
            if (err) {
                return next(err)
            }
            req.flash('success', `Welcome to YelpCamp ${user.username}`)
            res.redirect('/campgrounds')
        })
    } catch (error) {
        req.flash('error', error.message)
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', `Welcome back ${req.body.username}!!`)
    const redirectUrl = req.session.returnTo || '/campgrounds' //redirecting them to their page after login redirect
    delete req.session.returnTo     
    res.redirect(redirectUrl)
})

router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success', `Goodbye :(`);
    res.redirect('/campgrounds');
})

module.exports = router;