require('colors');

var Client = require('crp-job-client');
var error = require('../error');


exports =
module.exports = del;

module.exports.requiresAuth = true;

function del(args, credential) {
  var jobId = args._[0];
  if (! jobId) {
    error('No task id specified');
  }

  var client = Client({
    credential: credential
  });

  client.jobs.delete(jobId, function(err) {
    if (err) throw err;

    console.log('Task %s is scheduled for removal'.green, jobId);
  });
}
