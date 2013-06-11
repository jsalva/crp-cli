require('colors');
var util = require('util');

var Client = require('crp-job-client');

exports =
module.exports = faults;

module.exports.requiresAuth = true;

function faults(args, credential) {
  var jobId = args._[0];
  if (! jobId) {
    console.error('No task id specified');
    process.exit(-1);
  }

  var client = Client({
    credential: credential
  });

  client.jobs(jobId).faults.getAll(function(err, faults) {
    if (err) throw err;
    if (! faults.length) console.log('0 faults'.green);
    else console.log('Found %d faults:'.yellow, faults.length);
    util.inspect(faults);
  });

}