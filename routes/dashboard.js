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
  res.render('dashboard', { user: req.user });
});

module.exports = router;
