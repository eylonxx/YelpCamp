const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgrounds');
const Review = require('../models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  await Campground.deleteMany({});
  await Review.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '620a2ccee0065fd2db2eeec2',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      price: price,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat quam quisquam dolorum. Repudiandae consequatur blanditiis officiis officia laudantium nihil velit facilis consectetur molestias accusamus, et sit atque veniam, error incidunt.',
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
