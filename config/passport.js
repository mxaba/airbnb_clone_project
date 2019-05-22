const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy   = require('passport-local').Strategy;
const keys = require('./keys');
const User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/callback'
    }, (accessToken, refreshToken, email, done) => {
        // check if user already exists in our own db
        console.log(email.emails[0].value);
        User.findOne({googleId: email.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                
                console.log(email._json.picture);
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    googleId: email.id,
                    username: email.name[0].familyName,
                    email: email.emails[0].value,
                    thumbnail: email._json.picture
                })
                .save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    }),
);
