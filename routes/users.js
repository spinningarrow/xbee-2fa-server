var passport = require('passport');

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
	// res.send('You need to login');
}

module.exports = function (app) {

	// Authenticate a user (basically show that it exists)
	// Returns 401 if the username/password don't match
	app.get('/login', passport.authenticate('basic', { session: false }), function (req, res) {
		res.json(req.user.username);
	});
};