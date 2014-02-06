#!/usr/bin/env node

var sys = require('sys')
var exec = require('child_process').exec

var express = require('express')
var app = express()
var mongoose = require('mongoose')

// Connect to mongodb
mongoose.connect('mongodb://localhost/arduino2fa')
var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error: '))

var txSchema = mongoose.Schema({
	nodeId: String,
	data: String,
	time: Number
})

var Tx = mongoose.model('Tx', txSchema)

// var tx1 = new Tx({
// 	nodeId: '111',
// 	data: '0xFA',
// 	time: new Date().toISOString()
// })

// tx1.save(function (error, tx1) {
// 	if (error) {
// 		console.log(error)
// 	}

// 	console.log(tx1)
// })

// Routes

// Index route; do nothing useful
app.get('/', function(request, response) {
	response.send('Hello, world!')
})

// User login
// Server checks credentials, establishes secure channel

// Server verifies OTA is legitimate and sends OTA key of sensor Node
// to device
app.get('/key/:nodeId', function(request, response) {
	nodeList = {
		"111": "1234",
		"007": "9999"
	}

	nodeKey = nodeList[request.params.nodeId]

	response.send(nodeKey ? nodeKey : 'ERROR: Node not found')
})

// Sensor node sends details of device + 2FA code request
// NOTE
// this is not correct; Java code will ping the server when it receives
// a request from the attached XBee!
// WE HAVE A PROBLEM
app.post('/mobile2fa', function (request, response) {
	var deviceId = request.params.deviceId
	var authId = request.params.authId // 2FA request ID
})

// Mobile device sends details of OTA and 2FA code request to server
// app.post('sensor2fa')

// Server verifies legitimate OTA and sends 2FA code to sensor

// Server verifies legitimate OTA and sends 2FA code to mobile device
// via email or SMS

// Test route (test LED on/off broadcast)
app.get('/led/:action', function (request, response) {

	// Get the desired action string and capitalise it
	var ledAction = request.params.action.toLowerCase()
	// ledAction = ledAction.charAt(0).toUpperCase() + ledAction.slice(1)

	var command = 'cd xbee_api_jar && java -jar xbee-api.jar -led' + ledAction

	// exec(command, function (error, stdout, stderr) {
	// 	sys.print(stdout)
	// })

	// Add Tx request to queue
	var txRequest = new Tx({
		nodeId: '111',
		data: ledAction === 'on' ? '0xFF' : '0x00',
		time: new Date().getTime()
	})

	txRequest.save(function (error, tx1) {
		if (error) {
			console.log(error)
		}

		console.log(tx1)
	})

	response.send('LED turned ' + ledAction)
})

// Get tx queue for a particular node and timestamp
app.get('/txqueue', function (request, response) {

	Tx.find().sort({ time: -1 }).findOne(function (err, tx) {
		if (err) {
			console.log(err)
		}

		console.log(tx)
		response.json(tx)
	})

	// response.send('TxQueue')
})

app.get('/txqueue/:nodeId', function (request, response) {

	Tx.find({ nodeId: request.params.nodeId }, function (err, txes) {
		if (err) {
			console.log(err)
		}

		console.log(txes)
		response.json(txes)
	})

	// response.send('TxQueue')
})

/// TESTSETSETSETS
app.post('/echopackets', express.bodyParser(), function (request, response) {
	sys.print(request.body ? request.body.rx : 'No data received')
	response.send('Nothing to display.')
})

// Init
var port = 4000

app.listen(port)
console.log('Started server. Listening on port ' + port + '...')