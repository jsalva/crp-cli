require('colors');

var JobClient = require('crp-job-client');
var error = require('../error');


exports =
module.exports = del;
module.exports.requiresAuth = true;
module.exports.usage = usage;
function usage(name, args) {
  args.
    alias('a', 'all');
};

function del(args, credential) {
  var jobId = args._[0];
  if (! jobId && !args.all) {
    error('No task id specified');
  }

  var client = JobClient({
    credential: credential
  });

  if (! args.all)
    client.jobs.destroy(jobId, function(err) {
      if (err) throw err;

      console.log('Task %s is scheduled for removal'.green, jobId);
    });
  else
    client.jobs.deleteAll(function(err) {
      if (err) throw err;
      console.log('All tasks are scheduled for removal'.green);
    });
}

