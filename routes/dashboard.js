var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('dashboard', {page:'Dashboard', menuId:'dashboard', user: req.user} );
});

module.exports = router;
