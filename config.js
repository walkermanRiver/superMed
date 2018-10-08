var util = require('util');
var path = require('path');
var Fabric_Client = require('fabric-client');

var file = 'network-config%s.json';

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');

Fabric_Client.addConfigFile(path.join(__dirname, 'config', file));
Fabric_Client.addConfigFile(path.join(__dirname, 'config','config.json'));