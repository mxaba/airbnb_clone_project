const mongoose = require('mongoose');

// connect to mongodb

mongoose.connect('mongodb//:localhost/testing');

mongoose.connection.once('open', function(){
    console.log('connection has been made');
}).on('error', function(error){
    console.log('Connection error:', error);
});