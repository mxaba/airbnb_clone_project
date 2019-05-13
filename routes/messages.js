var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('dashboard-messages', {page:'Dashboard-messages', menuId:'dashboard-messages', user: req.user} );
});

module.exports = router;