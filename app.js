var express = require('express');
var path = require('path');
var logger = require('morgan');
const cookieSession = require('cookie-session')
var index = require('./routes/index');
var authRoutes = require('./routes/auth-routes');
var homeRoutes = require('./routes/home-routes');
var dashboard = require('./routes/dashboard');
var messages = require('./routes/messages');
const keys = require('./config/keys');
var passport = require('passport');
var passportSetup = require('./config/passport');
var mongoose = require('mongoose');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set up session cookies
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

var publicDir = require('path').join(__dirname,'');
app.use(express.static(publicDir));

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, { useNewUrlParser: true }, () => {
    console.log('connected to mongodb');
    
});

// set path for static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'models')));
app.use(express.static(path.join(__dirname, 'config')));

// routes
app.use('/', index);
app.use('/auth', authRoutes);
app.use('/home', homeRoutes);
app.use('/dashboard', dashboard);
app.use('/dashboard-messages', messages);

/*app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.render('error', {status:err.status, message:err.message});
});

module.exports = app;
