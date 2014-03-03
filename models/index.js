var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var SALT_WORK_FACTOR = 10;

// User model
var userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true},
});

// Bcrypt middleware for users
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

// Bcrypt password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

// Transmission model
var transmissionSchema = mongoose.Schema({
	nodeId: String,
	deviceId: String,
	token: String,
	time: Number
});

// Sensor node model
var nodeSchema = mongoose.Schema({
	nodeId: String,
	authKey: String
});

module.exports = {
	User: mongoose.model('User', userSchema),
	Transmission: mongoose.model('Transmission', transmissionSchema),
	Node: mongoose.model('Node', nodeSchema)
};