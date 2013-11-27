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

function del(args, token) {
  var jobId = args._[0];
  if (! jobId && !args.all) {
    error('No task id specified');
  }

  var jobClient = JobClient({
    token: token
  });

  if (! args.all)
    jobClient(jobId).destroy(function(err) {
      if (err) return console.error(err);

      console.log('Deleted %s'.green, jobId);
    });
  else
    jobClient.deleteAll(function(err) {
      if (err) throw err;
      console.log('All tasks are scheduled for removal'.green);
    });
}

