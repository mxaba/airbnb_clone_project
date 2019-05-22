const mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    surname: String,
    googleId: String,
    thumbnail: String,
    email : String,
    password : String,
});

const User = mongoose.model('user', userSchema);

module.exports = User;