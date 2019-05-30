var mongoose = require('mongoose');

var usersSchema = mongoose.Schema ({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String},
  resetToken: String,
  resetTokenExpire: Date,
  googleId: String,
  thumbnail: String,
});

mongoose.model('User', usersSchema);


