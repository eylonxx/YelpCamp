const { required } = require('joi');
const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const Schema = mongoose.Schema;
const Review = require('./review');
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
//I can nest schemas, and use virtuals to add a "function" on one, this is not stored in mongodb, only on every instance of a model
ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_250');
});

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ['Point'], //must be point (enum gives option, by doing it this way it forces it to be POINT)
        required: true,
      },
      coordinates: {
        type: [Number], //lon and lan so must be in array
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  opts
);
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `<strong><a href="/campgrounds/${
    this._id
  }">${this.title}</a></strong><p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
  //middleware for a findanddelete to remove reviews
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
