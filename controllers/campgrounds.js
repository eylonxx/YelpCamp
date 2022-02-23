const Campground = require('../models/campgrounds');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({ query: req.body.campground.location, limit: 1 }).send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  })); //array of path and name
  campground.author = req.user._id; //.author is an id (obj id -> user id) so i can use req.user (from passport) to get that
  await campground.save();
  console.log(campground);
  req.flash('success', 'Succesfuly made a new campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'author' } }) //populate review and
    // also populate author that is in reviews (review's author)
    .populate('author'); // then populate campground's author
  if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/camgrounds');
  }
  res.render('campgrounds/show', { campground });
};

module.exports.renderEditCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/camgrounds');
  }

  res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  })); //new array with images
  campground.images.push(...imgs); //spread it so we d ont get array inside an array
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
      //for every filename for req.body.deleteimages, take that file name and pass it as a param to cloudinary...destroy
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  } //pull from the images array, all the imgaes where the file name is in the deleteimages array
  await campground.save();
  console.log(campground);

  req.flash('success', 'Succesfuly updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  for (let image of campground.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  req.flash('success', 'Successfuly deleted campground');
  res.redirect('/campgrounds');
};
