const mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

// const userSchema = new Schema({
//     username: String,
//     googleId: String,
//     thumbnail: String,
//     email : String,
//     password : String,
// });



const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email :{
        type:  String,
        required: true},

    password : {
        type:  String,
        required: true},
});
const User = mongoose.model('user', userSchema);

module.exports = User;