'use strict';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var loggerMorgan = require('morgan');
// var http = require('http');
var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');


var Fabric_Client = require('fabric-client');
// var util = require('util');

require('./config.js');
var query = require('./app/query.js');
var invoke = require('./app/invoke-transaction.js');
// var config = require('./config.json');



var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(loggerMorgan('dev'));
app.use(bodyParser.json());
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

function queryChainCode(req, res, next, fcn, args) {
	var chaincodeName = Fabric_Client.getConfigSetting('chainCodeName');
	let orgname  = Fabric_Client.getConfigSetting('orgName');	
	let userName = Fabric_Client.getConfigSetting('userName');

	logger.debug('begin query chain code');	
	logger.debug('fcn : ' + fcn);	
	logger.debug('args : ' + args);	

	query.queryChaincode(chaincodeName, args, fcn, userName, orgname)
	.then(function(vResult) {
		res.send({
            success: true,
            result: vResult
        });
	});
}

function invokeChainCode(req, res, next, fcn, args) {
	let channelName = Fabric_Client.getConfigSetting('channelName');
	let chaincodeName = Fabric_Client.getConfigSetting('chainCodeName');
	let orgname  = Fabric_Client.getConfigSetting('orgName');	
	let userName = Fabric_Client.getConfigSetting('userName');	
	let peers = null;	

	logger.debug('begin invoke chain code');	
	logger.debug('fcn : ' + fcn);	
	logger.debug('args : ' + args);	

    try {
        invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, userName, orgname)
            .then(function(vResult) {
            	if (vResult.indexOf('error') > -1) {
                    res.send({
                        success: false,
                        result: vResult
                    });
				}else {
                    res.send({
                        success: true,
                        result: vResult
                    });
				}

            }, function (err) {
                console.log("!!!!!!!!!!!!!!!!!");
                console.log(err);
            })
    } catch(err) {
        console.log("!!!!!!!!!!!!!!!!!");
        console.log(err);
        return null;
    }
}

app.get('/userInfo/:userId', function(req, res, next) {
  	logger.debug('==================== QUERY BY CHAINCODE ==================');	
  	let userId = req.params.userId;
	let fcn = "getUser";
	let args = [userId];

	queryChainCode(req, res, next, fcn, args);
});

app.get('/userCaseRecord/:userId', function(req, res, next) {
  	logger.debug('==================== QUERY BY CHAINCODE ==================');	
  	let userId = req.params.userId;
	let fcn = "queryUserCaseHistory";
	let args = [userId];

	queryChainCode(req, res, next, fcn, args);
});

// Invoke transaction on chaincode on target peers
app.post('/case', function(req, res, next) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	
	let fcn = "createCase";	
	let args = req.body.args;

    invokeChainCode(req, res, next, fcn, args);
});

app.get('/allCars', function(req, res, next) {
  	logger.debug('==================== QUERY BY CHAINCODE ==================');	

	let fcn = "queryAllCars";
	let args = [''];

	queryChainCode(req, res, next, fcn, args);
});

// Invoke transaction on chaincode on target peers
app.post('/car', function(req, res, next) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	
	let fcn = "createCar";	
	let args = req.body.args;

    invokeChainCode(req, res, next, fcn, args);
});




// // Query on chaincode on target peers
// app.post('/channels/:channelName/chaincodes/:chaincodeName/query', function(req, res) {
// 	logger.debug('==================== QUERY BY CHAINCODE ==================');
// 	var channelName = req.params.channelName;
// 	var chaincodeName = req.params.chaincodeName;
// 	let args = req.body.args;
// 	let fcn = req.body.fcn;
// 	let peer = req.body.peer;

// 	logger.debug('channelName : ' + channelName);
// 	logger.debug('chaincodeName : ' + chaincodeName);
// 	logger.debug('fcn : ' + fcn);
// 	logger.debug('args : ' + args);

// 	if (!chaincodeName) {
// 		res.json(getErrorMessage('\'chaincodeName\''));
// 		return;
// 	}
// 	if (!channelName) {
// 		res.json(getErrorMessage('\'channelName\''));
// 		return;
// 	}
// 	if (!fcn) {
// 		res.json(getErrorMessage('\'fcn\''));
// 		return;
// 	}
// 	if (!args) {
// 		res.json(getErrorMessage('\'args\''));
// 		return;
// 	}
// 	// args = args.replace(/'/g, '"');
// 	// args = JSON.parse(args);
// 	// logger.debug(args);

// 	query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname)
// 	.then(function(message) {
// 		res.send({
//             success: true,
//             message: message
//         });
// 	});
// });

app.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// function getAllcars(req, res, next){

// 	logger.debug('==================== QUERY BY CHAINCODE ==================');
// 	// var channelName = req.params.channelName;
// 	var channelName = Fabric_Client.getConfigSetting('channelName');
// 	var chaincodeName = Fabric_Client.getConfigSetting('chainCodeName');
// 	let fcn = "queryAllCars";
// 	let args = [''];
// 	let orgname  = "org1";
// 	let peer = "peer1";
// 	let userName = "user1";

// 	logger.debug('channelName : ' + channelName);
// 	logger.debug('chaincodeName : ' + chaincodeName);
// 	logger.debug('fcn : ' + fcn);
// 	logger.debug('args : ' + args);
// 	if (!chaincodeName) {
// 		res.json(getErrorMessage('\'chaincodeName\''));
// 		return;
// 	}
// 	if (!channelName) {
// 		res.json(getErrorMessage('\'channelName\''));
// 		return;
// 	}
// 	if (!fcn) {
// 		res.json(getErrorMessage('\'fcn\''));
// 		return;
// 	}
// 	if (!args) {
// 		res.json(getErrorMessage('\'args\''));
// 		return;
// 	}
// 	// args = args.replace(/'/g, '"');
// 	// args = JSON.parse(args);
// 	// logger.debug(args);

// 	query.queryChaincode(peer, channelName, chaincodeName, args, fcn, userName, orgname)
// 	.then(function(message) {
// 		res.send({
//             success: true,
//             message: message
//         });
// 	});










	// var fabric_client = new Fabric_Client();

	// // setup the fabric network
	// var channel = fabric_client.newChannel('mychannel');
	// var peer = fabric_client.newPeer('grpc://localhost:7051');
	// channel.addPeer(peer);

	// //
	// var member_user = null;
	// var store_path = path.join(__dirname, 'hfc-key-store');
	// console.log('Store path:'+store_path);
	// var tx_id = null;

	// // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
	// Fabric_Client.newDefaultKeyValueStore({ path: store_path
	// }).then((state_store) => {
	// 	// assign the store to the fabric client
	// 	fabric_client.setStateStore(state_store);
	// 	var crypto_suite = Fabric_Client.newCryptoSuite();
	// 	// use the same location for the state store (where the users' certificate are kept)
	// 	// and the crypto store (where the users' keys are kept)
	// 	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	// 	crypto_suite.setCryptoKeyStore(crypto_store);
	// 	fabric_client.setCryptoSuite(crypto_suite);

	// 	// get the enrolled user from persistence, this user will sign all requests
	// 	return fabric_client.getUserContext('user1', true);
	// }).then((user_from_store) => {
	// 	if (user_from_store && user_from_store.isEnrolled()) {
	// 		console.log('Successfully loaded user1 from persistence');
	// 		member_user = user_from_store;
	// 	} else {
	// 		throw new Error('Failed to get user1.... run registerUser.js');
	// 	}

	// 	// queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
	// 	// queryAllCars chaincode function - requires no arguments , ex: args: [''],
	// 	const request = {
	// 		//targets : --- letting this default to the peers assigned to the channel
	// 		chaincodeId: 'fabcar',
	// 		fcn: 'queryAllCars',
	// 		args: ['']
	// 		// chaincodeId: 'fabcar',
	// 		// fcn: 'queryCarHistory',
	// 		// args: ['CAR10']
	// 	};

	// 	// send the query proposal to the peer
	// 	return channel.queryByChaincode(request);	
	// }).then((query_responses) => {
	// 	console.log("Query has completed, checking results");
	// 	// query_responses could have more than one  results if there multiple peers were used as targets
	// 	if (query_responses && query_responses.length == 1) {
	// 		if (query_responses[0] instanceof Error) {
	// 			console.error("error from query = ", query_responses[0]);
	// 		} else {
	// 			let sResponse = query_responses[0].toString();				
	// 			console.log("Response is ", sResponse);
	// 			res.send(sResponse);
	// 		}
	// 	} else {
	// 		console.log("No payloads were returned from query");
	// 	}
	// }).catch((err) => {
	// 	console.error('Failed to query successfully :: ' + err);
	// });
// }

module.exports = app;




















// var os = require('os');

// //
