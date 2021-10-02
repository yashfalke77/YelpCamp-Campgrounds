const mongoose = require('mongoose');
const Review = require('./review')

const Schema = mongoose.Schema;
const opts = {toJSON: {virtuals: true}}

const ImageSchema = Schema({
    url:String,
    filename: String,
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', ('/upload/w_200'))
})

ImageSchema.virtual('index').get(function () {
    return this.url.replace('/upload', ('/upload/q_auto:low'))
})

ImageSchema.virtual('show').get(function () {
    return this.url.replace('/upload', ('/upload/q_auto:good'))
})

const CampgroundSchema = Schema({
    title: String,
    image: [
        ImageSchema
    ],
    price: Number,
    description: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    author:
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}<a></strong>
    <p>${this.description.substring(0, 20)}....</p>`
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);