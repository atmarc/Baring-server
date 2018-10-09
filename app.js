var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


//Arreglar warnings del mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Init App
var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:loginapp/";


app.post('/proves', function (req,res) {

    
});

function comparePassword (candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
    });
}
//Register
app.post('/register', function (req, res) {
    var username = req.query.username;
    var name = req.query.name;
    var password = req.query.password;
    // Encriptem la contrasenya
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) throw err;
            password = hash;
            //Si s'han entrat els tres parametres, guardem l'usuari
            if (name && password && username) {
                //afegim l'usuari a la BD
                MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("loginapp");
                    var User = { name: name, username: username, password: password };
                    dbo.collection("users").insertOne(User, function(err, res2) {
                    if (err) throw err;
                    console.log("User " + name + " has been added");
                    res.send("User " + name + " has been added");
                    db.close();
                    });
                });
            }
        });
    });   
});


function usuariRegistrat (id) {
    User.findById({_id: id}, function (err, resultat) {
        return resultat[0];
    });
}

app.post('/users', function(req, res) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("loginapp");
        dbo.collection("users").find({}).toArray(function(err, resultat) {
        if (err) throw err;
        res.send(resultat);
        db.close();
        });
    });
});

app.post('/deluser', function (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("loginapp");
        dbo.collection("users").deleteOne({name: req.query.name}, function(err, resultat) {
        if (err) throw err;
        res.send("User " + req.query.name + " has been deleted");
        db.close();
        });
    });
});

app.post('/hies', function(req, res) {
    var userId = req.query.id;
    var usuari = usuariRegistrat(userId);
    if (!userId) res.send('No ha passat Id');
    if (!usuari) res.send('No hi és');
    else if (usuari && userId) {
        res.send(usuari);
    }
});

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});