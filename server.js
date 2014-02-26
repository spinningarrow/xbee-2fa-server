var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var http = require('http');
var https = require('https');
var tls = require('tls');
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var SALT_WORK_FACTOR = 10;
var HTTPS_PORT = 8000;
var MONGO_URI = 'mongodb://localhost/xbee-2fa';

// Configure and connect to the database
mongoose.connect(MONGO_URI);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
	console.log('Connected to database.');
});

// Configure Express
var app = express();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));
	app.use(express.logger());

	app.use(express.cookieParser());
	// app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.urlencoded());

	app.use(express.methodOverride());
	app.use(express.session({ secret: 'keyboard cat' }));
	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(__dirname + '/../../public'));
});

var httpsOptions = {
	key: fs.readFileSync('keys/private-key.pem'),
	cert: fs.readFileSync('keys/public-cert.pem')
};

// Start HTTPS server
var httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(HTTPS_PORT, function () {
	console.log('HTTPS server started. Listening on port ' + HTTPS_PORT + '...');
});

// Include modules
require('./routes')(app);
var Models = require('./models');


/*// Seed a user
var adminUser = new Models.User({ username: 'admin', email: 'admin@example.com', password: 'admin' });

adminUser.save(function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log('user: ' + adminUser.username + " saved.");
	}
});*/