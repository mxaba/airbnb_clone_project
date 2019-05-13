var express = require('express');
var router = express.Router();


const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
  };

  router.get('/', authCheck, (req, res) => {
    res.render('dashboard-messages', { user: req.user });
  });

// router.get('/', function(req, res, next) {
//   res.render('dashboard-messages', {page:'Dashboard-messages', menuId:'dashboard-messages', user: req.user} );
// });

module.exports = router;