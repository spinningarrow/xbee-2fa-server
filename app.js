#!/usr/bin/env node

var sys = require('sys')
var exec = require('child_process').exec

var express = require('express')
var app = express()

// Routes

// Index route; do nothing useful
app.get('/', function(request, response) {
	response.send('Hello, world!')
})

// User login
// Server checks credentials, establishes secure channel

// Server verifies OTA is legitimate and sends OTA key of sensor Node
// to device

// Sensor node sends details of device + 2FA code request

// Mobile device sends detauls of OTA and 2FA code request to server

// Server verifies legitimate OTA and sends 2FA code to sensor

// Server verifies legitimate OTA and sends 2FA code to mobile device
// via email or SMS

// Test route (test LED on/off broadcast)
app.get('/led/:action', function(request, response) {

	// Get the desired action string and capitalise it
	var ledAction = request.params.action.toLowerCase()
	ledAction = ledAction.charAt(0).toUpperCase() + ledAction.slice(1)

	var command = 'cd xbee_api_jar && java -jar xbee-api.jar -led' + ledAction

	exec(command, function (error, stdout, stderr) {
		sys.print(stdout)
	})

	response.send('LED turned ' + ledAction)
})

// Init
var port = 4000

app.listen(port)
console.log('Started server. Listening on port ' + port + '...')