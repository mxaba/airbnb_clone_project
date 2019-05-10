var router = require('express').Router();

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
  };
  
  router.get('/', authCheck, (req, res) => {
    res.render('home', { user: req.user });
  });

  router.get('/', (req, res) => {
    // res.render('room', { user: req.user });
    console.log('okay');
  });

  module.exports = router;