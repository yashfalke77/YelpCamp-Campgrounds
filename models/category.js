const mongoose = require('mongoose');
const Review = require('./review')

const Schema = mongoose.Schema;
const opts = {toJSON: {virtuals: true}} //virtuals can be accessed in JSON



const categorySchema = Schema({
    title: {
        type: String,
    },
    image: {
        url:String,
        filename: String,
    }, 
    description:String,
})


module.exports = mongoose.model('Category', categorySchema);
