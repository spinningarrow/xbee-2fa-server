var sys = require('sys')
var exec = require('child_process').exec

var express = require('express')
var app = express()

app.get('/', function(req, res) {
	res.send('Hello, world!')
})

app.get('/led', function(req, res) {
	exec('cd xbee_api_jar && java -jar xbee-api.jar', function () {

	})
	res.send('LED stuff')
})

app.listen(4000)
console.log('Listening on port 4000')