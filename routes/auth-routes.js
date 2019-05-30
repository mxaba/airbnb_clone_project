var express = require('express');
var session = require('express-session');
var passport = require('passport');
var router = express.Router();
var user = require('../app/models/user');
var mongoose = require('mongoose');
var User = mongoose.model('User');

  // auth logout
  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
  
  // auth with google+
  router.get('/google', passport.authenticate('google', {
    scope: ['email']
  }));
  
  // callback route for google to redirect to
  // hand control to passport to use code to grab profile info
  router.get('/google/callback', passport.authenticate('google'), (req, user)=> {
/*     req.session.user = user;
           req.session.save(); */
    res.redirect("/");

  });

  module.exports = router;