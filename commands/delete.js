require('colors');

var TaskClient = require('crp-task-client');
var error = require('../error');


exports =
module.exports = del;

module.exports.requiresAuth = true;

function del(args, credential) {
  var taskId = args._[0];
  if (! taskId) {
    error('No task id specified');
  }

  var client = TaskClient({
    credential: credential
  });

  client.tasks.delete(taskId, function(err) {
    if (err) throw err;

    console.log('Task %s is scheduled for removal'.green, taskId);
  });
}
