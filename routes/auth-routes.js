var express = require('express');
var router = express.Router();
var passport = require('passport');


router.get('/login', function(req, res, next) {
    res.render('login', {page:'login', menuId:'login'});
  });
  
  // auth logout
  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
  
  // auth with google+
  router.get('/google', passport.authenticate('google', {
    scope: ['profile']
  }));
  
  // callback route for google to redirect to
  // hand control to passport to use code to grab profile info
  router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
    res.redirect('/profile');
  });

  module.exports = router;