module.exports = function (app, Models) {
	require('./main')(app, Models);
	require('./users')(app);
};