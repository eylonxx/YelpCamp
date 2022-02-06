const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewScehma } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campgrounds');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use('/campgrounds', campgrounds) //router
app.use('/campgrounds/:id/reviews', reviews) //router


app.all('*', (req, res, next) => { // moves to app.use a new error (passed to next)
    next(new ExpressError('Page Not found', 404));
})

app.use((err, req, res, next) => { //basic eerror handler
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'oh no something went wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000!')
});

