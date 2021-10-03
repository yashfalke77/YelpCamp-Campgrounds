if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const mongoose = require('mongoose');
const db = mongoose.connection;
const Campground = require('../models/campgrounds');
const Category = require('../models/category');
const cities = require('./cities')
const { places, descriptors } = require('./seedhelpers')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxtoken = 'pk.eyJ1IjoieWFzaGZhbGtlNzciLCJhIjoiY2t1MjQ2Z2cwMmxjazJvbXI2OGk5b2V0dSJ9.BGnMIJbpa2OzthfRTtTP6w'
const geocoder = mbxGeocoding({ accessToken: mapBoxtoken })
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl);
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database Connected');
});

const user = ["615982985ca687a625b4acec", "6159c8a979bc9b6ee481a9ef", "6159c91a79bc9b6ee481a9fb"]

const sample = array => array[Math.floor(Math.random() * array.length)];

const catSample = array => Math.floor(Math.random() * array.length)

const images = [
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636239/YelpCamp/mt7vew46iuelyjperm02.jpg',
        filename: 'YelpCamp/mt7vew46iuelyjperm02',
    },
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636244/YelpCamp/trvehxjujs8frbrjrfil.jpg',
        filename: 'YelpCamp/trvehxjujs8frbrjrfil',
    },
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636247/YelpCamp/amniou07rihgxtsagsca.jpg',
        filename: 'YelpCamp/amniou07rihgxtsagsca',
    },
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636248/YelpCamp/t5xqmk2ijt0o0shdbkkh.jpg',
        filename: 'YelpCamp/t5xqmk2ijt0o0shdbkkh',
    },
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636469/YelpCamp/qry2l5ntcxmpstungx9q.jpg',
        filename: 'YelpCamp/qry2l5ntcxmpstungx9q',
    },
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636471/YelpCamp/kan7ktxqgynjudblesv8.jpg',
        filename: 'YelpCamp/kan7ktxqgynjudblesv8',
    },
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636474/YelpCamp/y5xf7zdzgn5vi444qpsx.jpg',
        filename: 'YelpCamp/y5xf7zdzgn5vi444qpsx',
    },
    {
        url: 'https://res.cloudinary.com/dhbiouaym/image/upload/v1632636476/YelpCamp/qmmxwz5prukysbohozaz.jpg',
        filename: 'YelpCamp/qmmxwz5prukysbohozaz',
    }
]


const seeDB = async () => {
    // await Campground.deleteMany({});
    const category = await Category.find({})
    for (let index = 0; index < 50; index++) {
        const random400 = Math.floor(Math.random() * 400);
        const randCat = Math.floor(Math.random() * 6)
        const random8 = Math.floor(Math.random() * 8)
        const random3 = Math.floor(Math.random() * 3 )
        const price = Math.floor(Math.random() * 20) + 10;
        const location = `${cities[random400].city}, ${cities[random400].admin_name}`
        const geodata = await geocoder.forwardGeocode({
            query: location,
            limit: 1
        }).send()
        const camp = new Campground({
            author: user[random3],
            location: location,
            geometry: geodata.body.features[0].geometry,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: images[random8],
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias modi libero exercitationem excepturi nobis recusandae assumenda consequatur fugit omnis, nihil voluptates dolore, provident sequi minus sint iusto. Esse, asperiores velit.',
            price: price,
            category: category[randCat]._id
            
        })
        // console.log(categories[randCat]._id);
        await camp.save();
    }
}

seeDB()
    .then((result) => {
        db.close()
    }).catch((err) => {
        console.log(err);
    });