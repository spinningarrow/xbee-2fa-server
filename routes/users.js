module.exports = function (app) {
	// var passport = require('passport');

	app.get('/', function(req, res){
		res.render('index', { user: req.user });
	});

	app.get('/account',/* ensureAuthenticated,*/ function(req, res){
		res.render('account', { user: req.user });
	});

	app.get('/login', function(req, res){
		res.render('login', { user: req.user, message: req.session.messages });
	});

	// POST /login
	//   This is an alternative implementation that uses a custom callback to
	//   acheive the same functionality.
	app.post('/login', function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err) {
				return next(err);
			}

			if (!user) {
				req.session.messages =  [info.message];
				return res.redirect('/login');
				// return res.status(401).send('Not logged in; try again\n');
			}

			req.logIn(user, function(err) {
				if (err) { return next(err); }
				// return res.status(200).send('Logged in successfully\n');
				return res.redirect('/');
			});
		})(req, res, next);
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
};