require('colors');
var util = require('util');

var JobClient = require('crp-job-client');
var error = require('../error');

exports =
module.exports = show;

module.exports.requiresAuth = true;

function show(args, token) {
  var jobId = args._[0];
  if (! jobId) {
    console.error('No task id specified');
    process.exit(-1);
  }

  var jobs = JobClient({
    token: token
  });

  jobs(jobId).show(function(err, stats) {
    if (err) error(err);
    console.log(stats)
    /*
    var percentage = 0;
    if (stats.total) percentage = (stats.complete / stats.total) * 100;
    console.log('Progress for task %s:', jobId.yellow);

    console.log('\tState:  :\t%s %s', stats.state, stats.cancelReason || ''); 
    console.log('\tProgress:\t%s', util.format('%d%', percentage).green);
    console.log('\tTotal   :\t%s', stats.total.toString().green);
    console.log('\tComplete:\t%s', stats.complete.toString().green);
    console.log('\tPending :\t%s', stats.pending.toString().green);
    console.log('\tFaults: :\t%s', stats.faults.toString().green);
    console.log();

    if (percentage == 100) {
      console.log('You can download task results using `crowdprocess download %s`.\n', taskId);
    }*/
  });

}
