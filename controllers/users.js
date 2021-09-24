const User = require('../models/user');



module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', `Welcome back ${req.body.username}!!`)
    const redirectUrl = req.session.returnTo || '/campgrounds' //redirecting them to their page after login redirect
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', `Goodbye :(`);
    res.redirect('/campgrounds');
}