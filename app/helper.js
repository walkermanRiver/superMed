'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');

var path = require('path');
var util = require('util');
// var fs = require('fs-extra');
// var User = require('fabric-client/lib/User.js');
// var crypto = require('crypto');
// var copService = require('fabric-ca-client');

var hfc = require('fabric-client');
hfc.setLogger(logger);
var ORGS = hfc.getConfigSetting('network-config');
// var config = require('../config.json');

var clients = {};
var channels = {};
// var caClients = {};


// set up the client and channel objects for each org
for (let key in ORGS) {
	if (key.indexOf('org') === 0) {
		let client = new hfc();
		let cryptoSuite = hfc.newCryptoSuite();		

		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: getKeyStoreForOrg(ORGS[key].name)}));
		client.setCryptoSuite(cryptoSuite);

		let channel = client.newChannel(hfc.getConfigSetting('channelName'));
		channel.addOrderer(newOrderer(client));

		clients[key] = client;
		channels[key] = channel;


		setupPeers(channel, key, client);

		// let caUrl = ORGS[key].ca;
		// caClients[key] = new copService(caUrl, null /*defautl TLS opts*/, '' /* default CA */, cryptoSuite);
	}
}

function setupPeers(channel, org, client) {
	for (let key in ORGS[org].peers) {
		// let data = fs.readFileSync(path.join(__dirname, ORGS[org].peers[key]['tls_cacerts']));
		// let peer = client.newPeer(
		// 	ORGS[org].peers[key].requests,
		// 	{
		// 		pem: Buffer.from(data).toString(),
		// 		'ssl-target-name-override': ORGS[org].peers[key]['server-hostname'],
  //               'request-timeout' : config['request-timeout']
		// 	}
		// );

		//TBD peer2 has no successful reponse for invoke, now ignore it and does not join it into chain
		if(key === "peer2"){
			continue;
		}
		
		let peer = client.newPeer(
			ORGS[org].peers[key].requests
		);
		peer.setName(key);

		channel.addPeer(peer);
	}
}

function newOrderer(client) {
	return client.newOrderer(ORGS.orderer.url);
	// var caRootsPath = ORGS.orderer.tls_cacerts;
	// let data = fs.readFileSync(path.join(__dirname, caRootsPath));
	// let caroots = Buffer.from(data).toString();
	// return client.newOrderer(ORGS.orderer.url, {
	// 	'pem': caroots,
	// 	'ssl-target-name-override': ORGS.orderer['server-hostname'],
 //        'request-timeout' : config['request-timeout']
	// });
}

// function readAllFiles(dir) {
// 	var files = fs.readdirSync(dir);
// 	var certs = [];
// 	files.forEach((file_name) => {
// 		let file_path = path.join(dir,file_name);
// 		let data = fs.readFileSync(file_path);
// 		certs.push(data);
// 	});
// 	return certs;
// }

function getOrgName(org) {
	return ORGS[org].name;
}

function getKeyStoreForOrg(org) {
	let sAppPath = path.resolve(__dirname, '..');	
	return path.join(sAppPath, hfc.getConfigSetting('keyValueStore'), org);
}

function newRemotes(names, forPeers, userOrg) {	
	let client = getClientForOrg(userOrg);

	let targets = [];
	// find the peer that match the names
	for (let idx in names) {
		let peerName = names[idx];
		if (ORGS[userOrg].peers[peerName]) {
			// found a peer matching the name
			// let data = fs.readFileSync(path.join(__dirname, ORGS[userOrg].peers[peerName]['tls_cacerts']));
			// let grpcOpts = {
			// 	pem: Buffer.from(data).toString(),
			// 	'ssl-target-name-override': ORGS[userOrg].peers[peerName]['server-hostname']
			// };

			if (forPeers) {
				targets.push(client.newPeer(ORGS[userOrg].peers[peerName].requests));
			} else {
				let eh = client.newEventHub();			
				eh.setPeerAddr(ORGS[userOrg].peers[peerName].events);
				targets.push(eh);
			}
		}
	}

	if (targets.length === 0) {
		logger.error(util.format('Failed to find peers matching the names %s', names));
	}

	return targets;
}

// function queryChainCode(req, res, next, fcn, args) {	
// 	var channelName = hfc.getConfigSetting('channelName');
// 	var chaincodeName = hfc.getConfigSetting('chainCodeName');
// 	let orgname  = hfc.getConfigSetting('orgName');
// 	let peer = hfc.getConfigSetting('peerName');
// 	let userName = hfc.getConfigSetting('userName');

// 	query.queryChaincode(peer, channelName, chaincodeName, args, fcn, userName, orgname)
// 	.then(function(message) {
// 		res.send({
//             success: true,
//             message: message
//         });
// 	});
// }

// function invokeChainCode(req, res, next, fcn, args) {
// 	let channelName = hfc.getConfigSetting('channelName');
// 	let chaincodeName = hfc.getConfigSetting('chainCodeName');
// 	let orgname  = hfc.getConfigSetting('orgName');	
// 	let userName = hfc.getConfigSetting('userName');
	
// 	let peers = null;

// 	logger.debug("begin to call invoke js");	

//     try {
//         invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, userName, orgname)
//             .then(function(message) {
//             	if (message.indexOf('error') > -1) {
//                     res.send({
//                         success: false,
//                         message: message
//                     });
// 				}else {
//                     res.send({
//                         success: true,
//                         message: message
//                     });
// 				}

//             }, function (err) {
//                 console.log("!!!!!!!!!!!!!!!!!");
//                 console.log(err);
//             })
//     } catch(err) {
//         console.log("!!!!!!!!!!!!!!!!!");
//         console.log(err);
//         return null;
//     }
// }

//-------------------------------------//
// APIs
//-------------------------------------//
var getChannelForOrg = function(org) {
	return channels[org];
};

var getClientForOrg = function(org) {
	return clients[org];
};

// var newPeers = function(names, org) {
// 	return newRemotes(names, true, org);
// };

var newEventHubs = function(names, org) {
	return newRemotes(names, false, org);
};

var getMspID = function(org) {
	logger.debug('Msp ID : ' + ORGS[org].mspid);
	return ORGS[org].mspid;
};

// var getAdminUser = function(userOrg) {
// 	var users = hfc.getConfigSetting('admins');
// 	var username = users[0].username;
// 	var password = users[0].secret;
// 	var member;
// 	var client = getClientForOrg(userOrg);

// 	return hfc.newDefaultKeyValueStore({
// 		path: getKeyStoreForOrg(getOrgName(userOrg))
// 	}).then((store) => {
// 		client.setStateStore(store);
// 		// clearing the user context before switching
// 		client._userContext = null;
// 		return client.getUserContext(username, true).then((user) => {
// 			if (user && user.isEnrolled()) {
// 				logger.info('Successfully loaded member from persistence');
// 				return user;
// 			} else {
// 				let caClient = caClients[userOrg];
// 				// need to enroll it with CA server
// 				return caClient.enroll({
// 					enrollmentID: username,
// 					enrollmentSecret: password
// 				}).then((enrollment) => {
// 					logger.info('Successfully enrolled user \'' + username + '\'');
// 					member = new User(username);
// 					member.setCryptoSuite(client.getCryptoSuite());
// 					return member.setEnrollment(enrollment.key, enrollment.certificate, getMspID(userOrg));
// 				}).then(() => {
// 					return client.setUserContext(member);
// 				}).then(() => {
// 					return member;
// 				}).catch((err) => {
// 					logger.error('Failed to enroll and persist user. Error: ' + err.stack ?
// 						err.stack : err);
// 					return null;
// 				});
// 			}
// 		});
// 	});
// };

// var getLoginUsers = function(username, userOrg, isJson) {
//     var member;
//     var client = getClientForOrg(userOrg);
//     var enrollmentSecret = null;
//     return hfc.newDefaultKeyValueStore({
//         path: getKeyStoreForOrg(getOrgName(userOrg))
//     }).then((store) => {
//         client.setStateStore(store);
//         // clearing the user context before switching
//         client._userContext = null;
//         return client.getUserContext(username, true).then((user) => {
//             if (user && user.isEnrolled()) {
//                 logger.info('Successfully loaded member from persistence');
//                 return user;
//             } else {
//                 return username+" login failed";
//             }
//         });
//     }).then((user) => {
//         if (isJson && isJson === true) {
//             var response = {
//                 success: true,
//                 secret: user._enrollmentSecret,
//                 message: username + ' enrolled Successfully',
//             };
//             return response;
//         }
//         return user;
//     }, (err) => {
//         logger.error(util.format('Failed to get registered user: %s, error: %s', username, err.stack ? err.stack : err));
//         return '' + err;
//     });
// };

var getRegisteredUsers = function(username, userOrg, isJson) {
	var member;
	var client = getClientForOrg(userOrg);
	var enrollmentSecret = null;
	return hfc.newDefaultKeyValueStore({
		path: getKeyStoreForOrg(getOrgName(userOrg))
	}).then((store) => {
		client.setStateStore(store);
		// clearing the user context before switching
		client._userContext = null;
		return client.getUserContext(username, true).then((user) => {
			logger.info('user is =>' + user);
			if (user && user.isEnrolled()) {
				logger.info('Successfully loaded member from persistence');
				return user;
			} else {
				logger.info('Fail to load member from persistence');
				throw new Error('Failed to get user1.... run registerUser.js');
				return null;
				// let caClient = caClients[userOrg];
				// return getAdminUser(userOrg).then(function(adminUserObj) {
				// 	member = adminUserObj;
				// 	return caClient.register({
				// 		enrollmentID: username,
				// 		affiliation: userOrg + '.department1'
				// 	}, member);
				// }).then((secret) => {
				// 	enrollmentSecret = secret;
				// 	logger.debug(username + ' registered successfully');
				// 	return caClient.enroll({
				// 		enrollmentID: username,
				// 		enrollmentSecret: secret
				// 	});
				// }, (err) => {
				// 	logger.debug(username + ' failed to register');
				// 	return '' + err;
				// 	//return 'Failed to register '+username+'. Error: ' + err.stack ? err.stack : err;
				// }).then((message) => {
				// 	if (message && typeof message === 'string' && message.includes(
				// 			'Error:')) {
				// 		logger.error(username + ' enrollment failed');
				// 		return message;
				// 	}
				// 	logger.debug(username + ' enrolled successfully');

				// 	member = new User(username);
				// 	member._enrollmentSecret = enrollmentSecret;
				// 	return member.setEnrollment(message.key, message.certificate, getMspID(userOrg));
				// }).then(() => {
				// 	client.setUserContext(member);
				// 	return member;
				// }, (err) => {
				// 	logger.error(util.format('%s enroll failed: %s', username, err.stack ? err.stack : err));
				// 	return '' + err;
				// });;
			}
		});
	}).then((user) => {
		if (isJson && isJson === true) {
			var response = {
				success: true,
				secret: user._enrollmentSecret,
				message: username + ' enrolled Successfully',
			};
			return response;
		}
		return user;
	}, (err) => {
		logger.error(util.format('Failed to get registered user: %s, error: %s', username, err.stack ? err.stack : err));
		return '' + err;
	});
};

// var getOrgAdmin = function(userOrg) {
// 	var admin = ORGS[userOrg].admin;
// 	var keyPath = path.join(__dirname, admin.key);
// 	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
// 	var certPath = path.join(__dirname, admin.cert);
// 	var certPEM = readAllFiles(certPath)[0].toString();

// 	var client = getClientForOrg(userOrg);
// 	var cryptoSuite = hfc.newCryptoSuite();
// 	if (userOrg) {
// 		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: getKeyStoreForOrg(getOrgName(userOrg))}));
// 		client.setCryptoSuite(cryptoSuite);
// 	}

// 	return hfc.newDefaultKeyValueStore({
// 		path: getKeyStoreForOrg(getOrgName(userOrg))
// 	}).then((store) => {
// 		client.setStateStore(store);

// 		return client.createUser({
// 			username: 'peer'+userOrg+'Admin',
// 			mspid: getMspID(userOrg),
// 			cryptoContent: {
// 				privateKeyPEM: keyPEM,
// 				signedCertPEM: certPEM
// 			}
// 		});
// 	});
// };

// var setupChaincodeDeploy = function() {
// 	process.env.GOPATH = path.join(__dirname, hfc.getConfigSetting('CC_SRC_PATH'));
// };

var getLogger = function(moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('DEBUG');
	return logger;
};

exports.getChannelForOrg = getChannelForOrg;
exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
// exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.getMspID = getMspID;
exports.ORGS = ORGS;
// exports.newPeers = newPeers;
exports.newEventHubs = newEventHubs;
exports.getRegisteredUsers = getRegisteredUsers;
// exports.getOrgAdmin = getOrgAdmin;
// exports.getLoginUsers = getLoginUsers;
