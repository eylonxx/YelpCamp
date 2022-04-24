if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  //console.log(process.env.SECRET) access stuff on env file
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);

const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const User = require('./models/user');

const usersRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const { MongoStore } = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

//helmet
//CSP = allowing to load stuff for the document thats being served only from ->
const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net/',
  'https://res.cloudinary.com/dv5vm4sqh/',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net/',
  'https://res.cloudinary.com/dv5vm4sqh/',
];
const connectSrcUrls = [
  'https://*.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://events.mapbox.com',
  'https://res.cloudinary.com/dv5vm4sqh/',
];
const fontSrcUrls = ['https://res.cloudinary.com/dv5vm4sqh/'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dp01hn09x/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ['https://res.cloudinary.com/dv5vm4sqh/'],
      childSrc: ['blob:'],
    },
  })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
//
const store = new MongoDBStore({ url: dbUrl, secret, touchAfter: 24 * 60 * 60 });
store.on('error', function (e) {
  console.log('sesssion store error', e);
});
const sessionConfig = {
  store,
  name: 'session', //so it doesnt show up as 'connection.sid' and is easily targeted, not hidden but not default
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, //makes it so cookies are available through http (Reqs) only and not through js, so it cant be injected and used
    // secure: true, //<--- httpS, only available on httpsecure, localhost doesnt work on https so its commented until deployment
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //7days
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize()); //all of passport configs, from docs
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  //flash
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/campgrounds', campgroundsRoutes); //router
app.use('/campgrounds/:id/reviews', reviewsRoutes); //router
app.use('/', usersRoutes); //router

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  // moves to app.use a new error (passed to next)
  next(new ExpressError('Page Not found', 404));
});

app.use((err, req, res, next) => {
  //basic eerror handler
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'oh no something went wrong!';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Serving on port 3000!');
});
