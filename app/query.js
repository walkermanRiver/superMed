var helper = require('./helper.js');
var logger = helper.getLogger('Query');

var queryChaincode = function(chaincodeName, args, fcn, username, org) {	
	var channel = helper.getChannelForOrg(org);
	var client = helper.getClientForOrg(org);
	// var target = buildTarget(peer, org);
	return helper.getRegisteredUsers(username, org).then((user) => {
		// tx_id = client.newTransactionID();
		// send query
		var request = {
			chaincodeId: chaincodeName,			
			fcn: fcn,
			args: args
		};
		return channel.queryByChaincode(request);
	}, (err) => {
		logger.info('Failed to get submitter \''+username+'\'');
		return 'Failed to get submitter \''+username+'\'. Error: ' + err.stack ? err.stack :
			err;
	}).then((response_payloads) => {
		console.log("Query has completed, checking results");
		if (response_payloads) {
			for (let i = 0; i < response_payloads.length; i++) {
				logger.info(args[0]+' now has ' + response_payloads[i].toString('utf8') +
					' after the move');
				let vResult = JSON.parse(response_payloads[i].toString('utf8'));
				logger.info('json.parse returns ' + vResult);
				return vResult;
			}
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
	}).catch((err) => {
		logger.error('Failed to end to end test with error:' + err.stack ? err.stack :
			err);
		return 'Failed to end to end test with error:' + err.stack ? err.stack :
			err;
	});
}

exports.queryChaincode = queryChaincode;