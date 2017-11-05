#!/usr/bin/env node

var stdout = process.stdout;
var getStdin = require('get-stdin');
var _ = require('lodash');
var orgs;
var re;

// allow optional regex to be passed in from CLI
re = _.get(process, 'argv[2]', 'Atlas_Test_');
re = new RegExp(re);

// notes:
// - when piping to stdin for a node process, we _need_ to set a handler for the 'EPIPE' error event
//   which is inevitably triggered once previous process in the pipeline ends its output
stdout.on('error', function (err) {
  if (err.code === 'EPIPE') {
    return process.exit();
  }
});

// expect 'managedOrgs' JSON payload to be piped in
getStdin()
  .then(function (json) {
    orgs = JSON.parse(json).organizations;
    orgs = _.chain(orgs)
      .filter({
        'isAllowedToManage': true,
        'isTestOrg': true
      })
      .filter(function (org) {
        return re.test(org.customerName);
      })
      .map(function (org) {
        return _.pick(org, ['customerOrgId', 'customerName']);
      })
      .value();

    _.forEach(orgs, function (org) {
      stdout.write([org.customerOrgId, org.customerName].join('|') + '\n');
    });
  });
