require('colors');
var util = require('util');

var TaskClient = require('crp-task-client');
var error = require('../error');

exports =
module.exports = progress;

module.exports.requiresAuth = true;

function progress(args, credential) {
  var taskId = args._[0];
  if (! taskId) {
    console.error('No task id specified');
    process.exit(-1);
  }

  var client = TaskClient({
    credential: credential
  });

  client.tasks.progress(taskId, function(err, stats) {
    if (err) error(err);
    var percentage = 0;
    if (stats.total) percentage = (stats.complete / stats.total) * 100;
    console.log('Progress for task %s:', taskId.yellow);

    console.log('\tState:  :\t%s %s', stats.state, stats.cancelReason || ''); 
    console.log('\tProgress:\t%s', util.format('%d%', percentage).green);
    console.log('\tTotal   :\t%s', stats.total.toString().green);
    console.log('\tComplete:\t%s', stats.complete.toString().green);
    console.log('\tPending :\t%s', stats.pending.toString().green);
    console.log('\tFaults: :\t%s', stats.faults.toString().green);
    console.log();

    if (percentage == 100) {
      console.log('You can download task results using `crowdprocess download %s`.\n', taskId);
    }
  });

}
