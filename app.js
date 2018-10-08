var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/loginapp', { useNewUrlParser: true });
var db = mongoose.connection;
//Arreglar warnings del mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Init App
var app = express();

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));



// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index:true
    },
    password: {
        type: String
    },
    name: {
        type: String
    }
});

var User = mongoose.model('User', UserSchema);

// Funcio que encripta el password
User.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
};

app.post('/register', function (req, res) {
    var username = req.query.username;
    var name = req.query.name;
    var password = req.query.password;
    //Si s'han entrat els tres parametres, guardem l'usuari
    if (name && password && username) {
        var newUser = new User({
            username: username,
            name: name,
            password: password
        });
        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });
    }   
});



// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});