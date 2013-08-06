require('colors');
var util = require('util');

var Client = require('crp-job-client');
var error = require('../error');

exports =
module.exports = faults;

module.exports.requiresAuth = true;

function faults(args, credential) {
  var taskId = args._[0];
  if (! taskId) {
    console.error('No task id specified');
    process.exit(1);
  }

  var client = Client({
    credential: credential
  });

  client.tasks(taskId).faults.getAll(function(err, faults) {
    if (err) error(err);
    if (! faults.length) console.log('0 faults'.green);
    else console.log('Found %d faults in task %s:'.yellow, faults.length, taskId);
    faults = faults.map(function(fault) {
      fault = fault.fault;
      try {
        fault = JSON.parse(fault);
      } catch(_) { }
      if (fault.stack && typeof fault.stack == 'string') {
        fault.stack = fault.stack.split('\n');
      }
      return fault;
    });
    console.log(util.inspect(faults, {colors: true}));
  });

}