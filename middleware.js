module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req user', req.user); //always constains whether user is present or not
    // console.log(req.path, req.originalUrl); //gives the last path you visited
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!!')
        return res.redirect('/login')
    }
    next()
}