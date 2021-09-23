const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    }
})

userSchema.plugin(passportLocalMongoose); 
// It automatically creates a username field and password field

module.exports = mongoose.model('User', userSchema)