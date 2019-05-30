var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var db = require('./config/db');
var key = require('./config/crypt');
var passportSetup = require('./config/passport');
var listing = require('./app/models/listing');
var user = require('./app/models/user');
var mongoose = require('mongoose');
var session = require('express-session');
var Listing = mongoose.model('Listing');
var booking = require('./app/models/booking');
var Booking = mongoose.model('Booking');
var User = mongoose.model('User');
var engine = require('ejs-locals');
var nodemailer = require('nodemailer');
var async = require('async');
var authRoutes = require('./routes/auth-routes');
var crypto = require('crypto');
var stripe = require('stripe')('sk_test_UEQKfXbrPV26Uz9kTQxFFKFG00Du1Lj3ua');
mongoose.Promise = global.Promise;

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;



var bcrypt = require('bcryptjs');
  var saltRounds = 10;

  app.use(passport.initialize());
  app.use(passport.session());

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'mysecretphrase',
                  resave: false,
                  saveUninitialized: true
}));
app.use(function(req,res,next){
  res.locals.currentUser = req.session.user;
  next();
});

app.use('/auth', authRoutes);

app.engine('ejs', engine);
app.set("view engine", "ejs");

app.get('/', function (req, res) {
  
 Listing.find({}).where('available').where('booking').equals(null).exec(function(err, listings) {
  res.render("index", { listings });
});
});
app.get('/bookings/checkout/id', function (req, res) {
  
  Listing.find({}).where('available').where('booking').equals(null).exec(function(err, listings) {
   res.render("index", { listings });
 });
 });
app.post('/charge', (req, res) => {
 
  const amount = 2500;
 
  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer => stripe.charges.create({
    amount,
    description: 'AirBnB',
    currency: 'zar',
    customer:customer.id
  }))
  .then(charge => res.render('success'));
});
  

app.get('/success', (req, res) => {
  res.render('success');
});
app.get("/listings/new", function (req, res) {
  if (req.session.user) {
    res.render("listings/new", {});
  }
  else {
    res.redirect("/users/login");
  }
});
app.get("/listings/forgot", function (req, res) {
  res.render("users/forgot", {});
 
});

app.get("/bookings/checkout", function (req, res) {
 
  res.render("bookings/checkout", {});
  
});


  

app.post("/listings", function (req, res) {
  Listing.create({name: req.body.name,
                  description: req.body.description,
                  image:req.body.image,
                  location:req.body.location,
                  price: req.body.price,
                  available: req.body.available,
                  booking: null,
                  owner: req.session.user
                }),
     function (err, listing) {
      if (err) {
       
         res.send("There was a problem adding the information to the database.");
      } else {
         console.log('New listing has been created');
      }
    };
    console.log(req.body.name);
  res.redirect("/listings");
});


/*connection */
 
app.get("/listings", function(req, res) {
  if (req.session.filter_date) {
    Listing.find({}).where('available').equals(req.session.filter_date).where('booking').equals(null).exec(function(err, listings) {
      res.render("listings/index", { listings });
    });
  } else {
    res.render("listings/index", { listings: null });
  }
});




app.get("/bookings/new", function(req, res) {
  if (req.session.user) {
    require('url').parse("/booking/new", true);
    Listing.findById(req.query.id, function(err, listing) {
      req.session.listing = listing;
      req.session.save();
      res.render("bookings/new", { listing })
    });
  }
  else {
    res.redirect("/users/login");
  }
});

app.post("/bookings/new", function(req, res) {
  
  Listing.findById(req.session.listing, function(err, currentListing) {
    Booking.create({bookingDate: currentListing.available,
      confirmed: false,
      rejected: false,
      totalPrice: currentListing.price,
      listing: currentListing,
      listingName: currentListing.name,
      listingOwner: currentListing.owner,
      requester: req.session.user,
      requesterName: req.session.user.name
      });
     // Listing.find({email}).where('name').equals(req.session.filter_date).where('booking').equals(null).exec(function(err, listings)
  //       User.find({}).where('name').equals(currentListing.owner), function(er,found){
  //       if (found) {
  //         var smtpTransport = nodemailer.createTransport({
  //           service: 'Gmail', 
  //           auth: {
  //             user: key.Info.mail,
  //             pass: key.Info.pass
  //           }
  //         });
  //         var mailOptions = {
  //           to: 'User.email',
  //           from: 'no-reply@gmail.com',
  //           subject: 'Bookings',
  //           text: 'Someone bookEd yur hotel' + ' '+ '\n'
              
  //         };
  //         smtpTransport.sendMail(mailOptions, function(err) {
  //           console.log('mail sent');
  //           console.log(User.email);
            
           
  //         });
       res.redirect("/bookings");
  
  //         //res.send("There was a problem adding the information to the database.");
  //       } else {
  //         console.log('New booking has been created');
  //       }
   
  //    // console.log(currentListing.email)
  // }
});
})
app.get("/bookings", function(req, res) {
  Booking.find({'requester': req.session.user}, function(err, bookings) {
    Booking.find({}).where('requester').equals(req.session.user).exec(function(err, myBookings) {
      Booking.find({}).where('listingOwner').equals(req.session.user).exec(function(err, receivedBookings) {
          res.render("bookings/index", { myBookings, receivedBookings });
      });
    });
  });
})

app.get('/bookings/complete', function(req, res) {
  if (req.query.action === "confirm") {
    Booking.findById(req.query.booking_id, function(err, currentBooking) {
      Booking.findOneAndUpdate({ _id: currentBooking._id }, {$set: { confirmed: true } }, {new: true}, function(err, booking) {});
      Booking.find({}).where('listing').equals(currentBooking.listing).where('confirmed').equals(false).where('rejected').equals(false).exec(function(err, bookings) {
        bookings.forEach(function(booking) {
          Booking.findOneAndUpdate({ _id: booking._id }, {$set: { rejected: true } }, {new: true}, function(err, booking) {
          });
        });
        res.redirect('/bookings');
        Listing.findOneAndUpdate({ _id: currentBooking.listing }, {$set: { booking: currentBooking } }, {new: true}, function(err, listing) {});
      });
    })
  }
  else if (req.query.action === "reject") {
    Booking.findOneAndUpdate({ _id: req.query.booking_id }, {$set: { rejected: true } }, {new: true}, function(err, booking) {} );
    res.redirect('/bookings');
  }
});

app.get("/users/new", function (req, res) {
  res.render("users/new", {});
});
app.post("/users/new", function (req, res) {
  User.findOne({email:req.body.email}, function(err,user){
    if (!user){
   if (req.body.password === req.body.password_confirmation) {
     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
       
       User.create({name:      req.body.name,
                    email:     req.body.email,
                    password:  hash            }),
       function (err, listing) {
         if (err) {
           res.send("There was a problem adding the information to the database.");
         }
         else {
           console.log('New listing has been created');
         
         }
       };
       setTimeout(function() {
         User.findOne({'email': req.body.email}, function(err,user){
           req.session.user = user;
           req.session.save();
           res.redirect("/");
         });
       }, 6000);
     });
   }
   else {
     console.log("User add failure, password mismatch?");
     res.redirect("/users/new")};
 }
 else{
   console.log("User Already exsit");
   res.redirect("/users/new");
 }
 });
  })

app.post("/users/reset", function(req, res){
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf)
      {
        var token = buf.toString('hex');
        done(err,token);
      });
     },
     function(token,done) {
       User.findOne({email:req.body.email},function(err,user){
         if(!user){
           //req.flash('error', 'No account was found.');
           return res.render("users/forgot", {});
         }
       User.resetToken = token;
       User.resetTokenExpire = Date.now()  + 360000;

       user.save(function(err){
         done(err,token,user);
       });
     });
   },
   function(token,user,done){
     var smtpTransport = nodemailer.createTransport({
       service: 'Gmail', 
       auth: {
         user: key.Info.mail,
         pass: key.Info.pass
       }
     });
     var mailOptions = {
       to: req.body.email,
       from: 'no-reply@gmail.com',
       subject: 'Reset Password',
       text: 'Click here to reset your Password' + ' '+ '\n' +
         'http://' + req.headers.host + '/reset/' + token + '\n\n'
     };
     smtpTransport.sendMail(mailOptions, function(err) {
       console.log('mail sent');
       //req.flash('success', 'An e-mail has been sent to ' + User.email + ' with further instructions.');
       done(err, 'done');
      // res.render("users/forgot", {});
     });
   }

  ],function(err){
    if(err)
    return (err);
    res.render("users/forgot", {});
  });
 });


app.get('/users/login', function(req, res){
  res.render("users/login", {});
});
app.get('/reset/:token', function(req, res){
  res.render("reset", {});
});
app.post('/users/login', function(req, res){
  var userInput = req.body.password;
  User.findOne({'email': req.body.email}, function(err,user){
    if (user != null){
      var currentPassword = user.password;
      bcrypt.compare(userInput, currentPassword, function(err, bcryptRes) {
          if (bcryptRes == true) {
            User.findOne({'email': req.body.email}, function(err, user){
              req.session.user = user;
              req.session.save();
            });
            res.redirect("/");
          } else {
            res.redirect("/users/login");
          }
      });
    } else {
      console.log('fum katleho fuked me up !!')
      res.redirect("/users/new")
    };
  });
});
app.get('/listings_filter', function(req, res){
  req.session.filter_date = req.query.filter_date;
  Listing.find({}).where('available').equals(req.session.filter_date).where('booking').equals(null).exec(function(err, listings) {
    res.render("listings/index", { listings });
  });
});

// Edit Profile
app.get('/edit', (req, res) => {
  User.find({}).where('email').equals(req.session.user.email).exec(function(err, userinfo) {
    res.render("edit", { userinfo });
   console.log(User.email);
  });
});

app.get('/users/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.use(function(req,res,next){
  res.status(404).send('Sorry cant find that!');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
var PORT = 3000;
app.listen(PORT || 3000, function () {
  console.log('Connected !');
});


