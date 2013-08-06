require('colors');
var fs         = require('fs');
var inspect    = require('util').inspect;
var JSONStream = require('JSONStream');

var TaskClient = require('crp-task-client');
var error = require('../error');

exports =
module.exports = compute;

module.exports.usage =
function usage(name, args) {
  args.usage('Usage: crowdprocess' + ' ' + name + ' <task_id>');
};

module.exports.requiresAuth = true;

function compute(args, credential) {
  var taskId = args._[0];
  if (! taskId) {
    error('No task id specified');
  }

  var client = TaskClient({credential: credential});

  var ee = client.tasks.compute(taskId);

  ee.on('no task', function() {
    console.error('Couldn\'t find task with id %s', taskId);
    process.exit(-1);
  });

  ee.on('task', function(j) {
    console.log('Task %s found: %j', taskId, j);
  });

  ee.on('data', function(d) {
    console.log('got data unit:', d);
  });

  ee.on('result', function(d, r) {
    console.log('result is %j', r);
  });

  ee.on('end', function() {
    console.log('task ended.');
    process.exit(0);
  });

  ee.on('submitted', function() {
    console.log('result successfully submitted');
  });
};