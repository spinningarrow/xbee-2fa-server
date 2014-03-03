var fs = require('fs');
var https = require('https');
var http = require('http');
var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');

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

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-locals'));

app.use(express.logger());
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(express.static(__dirname + '/../../public'));

// Initialize Passport! Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);

// Include modules
var Models = require('./models');
var User = Models.User;
require('./users')(app, User);
require('./routes')(app, Models);

// Set up HTTPS and start server
var httpsOptions = {
	key: fs.readFileSync('keys/private-key.pem'),
	cert: fs.readFileSync('keys/public-cert2.pem')
};

var httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(HTTPS_PORT, function () {
	console.log('HTTPS server started. Listening on port ' + HTTPS_PORT + '...');
});

app.listen(3000);