const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password); //passportjs
    req.login(registeredUser, (err) => {
      if (err) return next(err); //if theres a problem just return to err to next (for error handler)
    });
    req.flash('success', 'Welcome to Yelp Camp!');
    res.redirect('/campgrounds');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = (req, res) => {
  //local=regular, could use google login or fb login
  //passport.authenticate > works like bcrypt compare
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  res.redirect(redirectUrl);
  delete req.session.returnTo;
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Successfuly logged you out!');
  res.redirect('/campgrounds');
};
