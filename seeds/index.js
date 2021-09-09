const mongoose = require('mongoose');
const db = mongoose.connection;
const Campground = require('../models/campgrounds');
const cities = require('./cities')
const { places, descriptors } = require('./seedhelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp');
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database Connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seeDB = async () => {
    await Campground.deleteMany({});
    for (let index = 0; index < 50; index++) {
        const random400 = Math.floor(Math.random() * 400);
        const camp = new Campground({
            location: `${cities[random400].city}, ${cities[random400].admin_name}`,
            title: `${sample(descriptors)} ${sample(places)}`,
        })
        await camp.save();
    }
}

seeDB()
    .then((result) => {
        db.close()
    }).catch((err) => {
        console.log(err);
    });