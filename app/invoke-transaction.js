'use strict';
// var path = require('path');
// var fs = require('fs');
var util = require('util');
// var hfc = require('fabric-client');
// var Peer = require('fabric-client/lib/Peer.js');
var helper = require('./helper.js');
var logger = helper.getLogger('invoke-chaincode');
var EventHub = require('fabric-client/lib/EventHub.js');
// var ORGS = hfc.getConfigSetting('network-config');

var invokeChaincode = function(peerNames, channelName, chaincodeName, fcn, args, username, org) {
	logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', org));
	var client = helper.getClientForOrg(org);
	var channel = helper.getChannelForOrg(org);
	
	var tx_id = null;

	var txRequest = null;
	return helper.getRegisteredUsers(username, org).then((user) => {
		tx_id = client.newTransactionID();
		logger.debug(util.format('Sending transaction "%j"', tx_id));
		// send proposal to endorser
		var request = {
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args,
			chainId: channelName,
			txId: tx_id
		};
		
        var txRequest = channel.sendTransactionProposal(request)
		return txRequest;
	}, (err) => {
		logger.error('Failed to enroll user \'' + username + '\'. ' + err);
		throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
	}).then((results) => {
		var proposalResponses = results[0];
		var proposal = results[1];
		var all_good = false;
		var errorMsg = null;
		logger.debug('proposalResponses count ======>' + proposalResponses.length);
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response &&
				proposalResponses[i].response.status === 200) {
				one_good = true;
				logger.info('transaction proposal was good');
			} 
			else {

    //             logger.error(proposalResponses[i]);
				// logger.error('transaction proposal was bad');
				// if (proposalResponses[i].message != null) {
    //                 return proposalResponses[i].message;
    //             }
                errorMsg = proposalResponses[i].message;
                logger.error(errorMsg);
				// add error return
                // throw new Error(proposalResponses[i].response);
			}
			//here the second proposalresponse is always error, so ignore it
			all_good = all_good || one_good;
		}
		if(!all_good){			
            return errorMsg;           
		}

		if (all_good) {
			logger.debug(util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
				proposalResponses[0].response.status, proposalResponses[0].response.message,
				proposalResponses[0].response.payload, proposalResponses[0].endorsement
				.signature));
			var request = {
				proposalResponses: proposalResponses,
				proposal: proposal
			};
			// set the transaction listener and set a timeout of 30sec
			// if the transaction did not get committed within the timeout period,
			// fail the test
			var transactionID = tx_id.getTransactionID();
			var eventPromises = [];

			if (!peerNames) {
				peerNames = channel.getPeers().map(function(peer) {
					return peer.getName();
				});
			}

			//only get the first peer since second peer fail
			// peerNames.pop();
			logger.debug(peerNames);


			//begin poc
			var promises = [];

			var sendPromise = channel.sendTransaction(request);
			promises.push(sendPromise); //we want the send transaction first, so that we know where to check status
			//end poc

			var eventhubs = helper.newEventHubs(peerNames, org);
			var event_hub = eventhubs[0];

			let txPromise = new Promise((resolve, reject) => {
				let handle = setTimeout(() => {
					event_hub.disconnect();
					resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
				}, 3000);
				event_hub.connect();
				event_hub.registerTxEvent(transactionID, (tx, code) => {
					// this is the callback for transaction event status
					// first some clean up of event listener
					clearTimeout(handle);
					event_hub.unregisterTxEvent(transactionID);
					event_hub.disconnect();

					// now let the application know what happened
					var return_status = {event_status : code, tx_id : transactionID};
					if (code !== 'VALID') {
						console.error('The transaction was invalid, code = ' + code);
						resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
					} else {
						console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
						resolve(return_status);
					}
				}, (err) => {
					//this is the callback if something goes wrong with the event registration or processing
					reject(new Error('There was a problem with the eventhub ::'+err));
				});
			});
			promises.push(txPromise);

			return Promise.all(promises);




			// for (let key in eventhubs) {
			// 	let eh = eventhubs[key];
			// 	eh.connect();

			// 	let txPromise = new Promise((resolve, reject) => {
			// 		let handle = setTimeout(() => {
			// 			eh.disconnect();
			// 			reject();
			// 		}, 30000);

			// 		eh.registerTxEvent(transactionID, (tx, code) => {
			// 			clearTimeout(handle);
			// 			eh.unregisterTxEvent(transactionID);
			// 			eh.disconnect();

			// 			if (code !== 'VALID') {
			// 				logger.error(
			// 					'The balance transfer transaction was invalid, code = ' + code);
			// 				reject();
			// 			} else {
			// 				logger.info(
			// 					'The balance transfer transaction has been committed on peer ' +
			// 					eh._ep._endpoint.addr);
			// 				resolve();
			// 			}
			// 		});
			// 	});
			// 	eventPromises.push(txPromise);
			// };
			// var sendPromise = channel.sendTransaction(request);
			// return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
			// 	logger.debug(' event promise all complete and testing complete');
			// 	return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
			// }).catch((err) => {
			// 	logger.error(
			// 		'Failed to send transaction and get notifications within the timeout period.'
			// 	);
			// 	return 'Failed to send transaction and get notifications within the timeout period.';
			// });
		} else {
			logger.error(
				'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
			);
			return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
		}
	}, (err) => {
		logger.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
			err;
	}).then((response) => {
		if (response.status === 'SUCCESS') {
			logger.info('Successfully sent transaction to the orderer.');
			return tx_id.getTransactionID();
		} else {
			if (response.status != null) {
                logger.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
			}else {
                return response;
			}

		}
	}, (err) => {
		logger.error('Failed to send transaction due to error: ' + err.stack ? err
			.stack : err);
		return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
			err;
	});
};

exports.invokeChaincode = invokeChaincode;
