const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); //this plugin is going to give our schema a username & password and other imp stuffs

module.exports = mongoose.model('User', UserSchema);

