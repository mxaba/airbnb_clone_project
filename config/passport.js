const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy   = require('passport-local').Strategy;
const keys = require('./keys');
var user = require('../app/models/user');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var bodyParser = require('body-parser');
var session = require('express-session');

mongoose.Promise = global.Promise;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    user.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/callback',
    }, (accessToken, refreshToken, email, done) => {
        // check if user already exists in our own db
        console.log(email);
        User.findOne({googleId: email.id}, function(req, currentUser){
       
        
        // .then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log(email);
                console.log('user is: ', currentUser);
                done(null, currentUser);
                /* req.session.currentUser = user;
                req.session.save(); */
            } else {
                // if not, create user in our db
                new User({
                    googleId: email.id,
                    name: email.displayName,
                    email: email.emails[0].value,
                    thumbnail: email._json.picture
                })
                .save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    /* req.session.user = newUser;
                    req.session.save(); */
                    done(null, newUser);
                });
            }
        }
        );
    }),
);
