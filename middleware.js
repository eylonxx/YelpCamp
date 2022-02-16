module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be signed in');
    //must return because the other code still runs.(not else)
    return res.redirect('/login');
  }
  next(); //middleware so we must call next
};
