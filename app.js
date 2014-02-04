#!/usr/bin/env node

var sys = require('sys')
var exec = require('child_process').exec

var express = require('express')
var app = express()

// Routes
app.get('/', function(req, res) {
	res.send('Hello, world!')
})

app.get('/led', function(req, res) {
	exec('cd xbee_api_jar && java -jar xbee-api.jar', function () {

	})
	res.send('LED stuff')
})

// Init
var port = 4000

app.listen(port)
console.log('Started server. Listening on port ' + port + '...')