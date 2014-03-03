var smtpTransport = require('../mail');
var passport = require('passport');

module.exports = function (app, Models) {
	// app.get('/', function (req, res){
	// 	res.send('Access denied.');
	// });
	var Node = Models.Node;
	var Transmission = Models.Transmission;

	app.get('/sendmail', function (req, res) {
		var mailOptions = {
			from: "xbee2fa@gmail.com", // sender address
			to: "sahil29@gmail.com", // list of receivers
			subject: "Your 2-factor authentication code", // Subject line
			text: "3249057"
		};

		smtpTransport.sendMail(mailOptions, function(error, response){
			if (error) {
				console.log(error);
				res.json(error);
			} else {
				console.log("Message sent: " + response.message);
				res.json(response.message);
			}

			// if you don't want to use this transport object anymore, uncomment following line
			smtpTransport.close(); // shut down the connection pool, no more messages
		});
	});

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

	app.get('/token-requests/:nodeId', function (req, res) {
		Transmission.find({ nodeId: req.params.nodeId }).sort({ time: -1 }).findOne(function (err, tx) {
				if (err) {
					console.log(err);
				}

				console.log(tx);
				res.json(tx);
			});

	});

	app.post('/token-requests', passport.authenticate('basic', { session: false }), function (req, res) {
		var nodeId = req.body.nodeId;
		var deviceId = req.body.deviceId;

		var token = Math.floor(Math.random() * 9999);

		// Add to transmission queue
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
		var mailOptions = {
			from: "xbee2fa@gmail.com", // sender address
			to: "sahil29@gmail.com", // list of receivers
			subject: "Your 2-factor authentication code", // Subject line
			text: "2FA Token: " + token
		};

		smtpTransport.sendMail(mailOptions, function(error, response){
			if (error) {
				console.log(error);
				res.json(error);
			} else {
				console.log("Message sent: " + response.message);
				res.json(response.message);
			}

			// if you don't want to use this transport object anymore, uncomment following line
			smtpTransport.close(); // shut down the connection pool, no more messages
		});

		res.json({
			n: nodeId,
			d: deviceId
		});
	});
};