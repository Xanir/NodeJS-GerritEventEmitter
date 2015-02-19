var Client = require('ssh2').Client;
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var FlieSystem = require('fs');

var GerritEventEmitter = function(host, port, username, sshKeyPath) {
	var conn = new Client();
	var eventEmitter = new EventEmitter2();
	conn.on('ready', function() {
		console.log('Client :: ready');
		conn.exec('gerrit stream-events', function(err, stream) {
			if (err) throw err;
			stream.on('close', function() {
				console.log('Stream :: close');
				conn.end();
			}).on('data', function(data) {
				var jData = JSON.parse(data);
				eventEmitter.emit(jData.type, jData);
			}).stderr.on('data', function(data) {
			  console.log('STDERR: ' + data);
			});
		});
	}).connect({
	  privateKey: FlieSystem.readFileSync(sshKeyPath),
	  host: host,
	  port: port,
	  username: username
	});

	this.events = eventEmitter;
};

exports.GerritEventEmitter = GerritEventEmitter;