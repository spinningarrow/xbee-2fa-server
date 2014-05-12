var mailer = require('../mail');
var passport = require('passport');
var Q = require('q');
var fs = require('fs');

module.exports = function (app, Models) {
	// Get specific models
	var User = Models.User;
	var Node = Models.Node;
	var Transmission = Models.Transmission;

	// Home
	app.get('/', function(req, res){
		res.json('Nothing to do here');
	});

	// Retrieve the encryption key for a specific node
	app.get('/keys/:nodeId', passport.authenticate('basic', { session: false }), function (req, res) {
		var nodeId = req.params.nodeId;

		Node.findOne({ nodeId: nodeId }, function (err, node) {
			if (err) {
				res.json(err);
			}

			else if (!node) {
				res.json('Node ' + nodeId + ' not found');
			}

			else {
				res.json(node);
			}
		});
	});

	// Get the latest pending token requests for all nodes
	app.get('/token-requests', passport.authenticate('basic', { session: false }), function (req, res) {

		// Use a list of promises
		var promises = [];

		Transmission.aggregate({ $group: { _id: '$nodeId', time: { $max: '$time' } } }).sort({ time: -1 }).exec(function (err, result) {
			result.forEach(function (row) {
				promises.push(Transmission.findOne({ nodeId: row._id, time: row.time }).exec());
			});

			// Respond with the results once all queries have executed
			Q.all(promises).then(function (results) {
				console.log(results);
				res.json(results);
			});
		});
	});

	// Get the latest from the pending token requests for a particular
	// node
	app.get('/token-requests/:nodeId', passport.authenticate('basic', { session: false }), function (req, res) {
		Transmission.find({ nodeId: req.params.nodeId }).sort({ time: -1 }).findOne(function (err, tx) {
				if (err) {
					console.log(err);
				}

				console.log(tx);
				res.json(tx);
			});

	});

	// Create a new token request for a particular node
	app.post('/token-requests', passport.authenticate('basic', { session: false }), function (req, res) {
		var nodeId = req.body.nodeId;
		var deviceId = req.body.deviceId;
		var username = req.user.username;

		// Create a 6-digit token
		var token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

		if (!nodeId || !deviceId) {
			res.json(400, 'Please provide both node and device IDs');
			return;
		}

		// Get the user's email address
		User.findOne({ username: username }, function (err, user) {
			if (err) {
				res.json(err);
			}

			if (!user) {
				res.json('No user found.');
			}

			// All good, get the email address
			var email = user.email;

			// Add to transmission queue so it can be sent to the XBee
			var tx = new Transmission({
				nodeId: nodeId,
				deviceId: deviceId,
				token: token,
				time: new Date().getTime()
			});

			tx.save(function (error, tx) {
				if (error) {
					console.log(error);
				}

				console.log(tx);
			});

			// Send token via email
			mailer.options.to = email;
			mailer.options.subject = "2-factor authentication code: " + token;
			mailer.options.html = "Node: " + nodeId + "<br>Device: " + deviceId + "<br>2FA Token: " + token;

			mailer.smtpTransport.sendMail(mailer.options, function(error, response){
				if (error) {
					console.log(error);
					res.json(500, error);
				} else {
					console.log("Message sent: " + response.message);
					res.json(response.message);
				}

				// if you don't want to use this transport object anymore, uncomment following line
				mailer.smtpTransport.close(); // shut down the connection pool, no more messages
			});
		});
	});

	// List all available files
	app.get('/files', function (req, res) {
		fs.readdir('files', function (error, fileNames) {
			if (error) {
				console.log(error);
				res.json(500, error);
			}

			var results = fileNames.map(function (fileName) {
				var fileDetails = {};
				fileDetails.name = fileName;

				var resultDeferred = Q.defer();
				var sizeDeferred = Q.defer();
				var contentsDeferred = Q.defer();

				// Get file size
				fs.stat('files/' + fileName, function(error, stats) {
					if (error) {
						sizeDeferred.reject(error);
					}

					else {
						sizeDeferred.resolve(stats.size);
					}
				});

				sizeDeferred.promise.then(function (size) {
					fileDetails.size = size;
				});

				// Get file contents
				fs.readFile('files/' + fileName, 'utf8',  function (error, data) {
					if (error) {
						contentsDeferred.reject(error);
					}

					else {
						contentsDeferred.resolve(data);
					}
				});

				contentsDeferred.promise.then(function (data) {
					fileDetails.data = data;
				});

				// Resolve promises
				Q.allSettled([sizeDeferred.promise, contentsDeferred.promise]).then(function () {
					resultDeferred.resolve(fileDetails);
				})

				return resultDeferred.promise;
			});

			Q.all(results).then(function (results) {
				console.log(results);
				res.json(results);
			});
		});
	});

	// Get a particular file's data
	app.get('/files/:fileName', function (req, res) {
		fs.readFile('files/' + req.params.fileName, 'utf8', function (error, data) {
			if (error) {
				res.json(500, error);
			}

			else {
				res.json(data);
			}
		});
	});
};