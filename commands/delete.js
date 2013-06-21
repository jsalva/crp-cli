require('colors');

var Client = require('crp-job-client');

exports =
module.exports = del;

module.exports.requiresAuth = true;

function del(args, credential) {
  var jobId = args._[0];
  if (! jobId) {
    console.error('No task id specified');
    process.exit(-1);
  }

  var client = Client({
    credential: credential
  });

  client.jobs.delete(jobId, function(err) {
    if (err) throw err;

    console.log('Task deleted');
  });
}
