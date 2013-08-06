require('colors');

var Client = require('crp-job-client');
var error = require('../error');


exports =
module.exports = del;

module.exports.requiresAuth = true;

function del(args, credential) {
  var taskId = args._[0];
  if (! taskId) {
    error('No task id specified');
  }

  var client = Client({
    credential: credential
  });

  client.tasks.delete(taskId, function(err) {
    if (err) throw err;

    console.log('Task %s is scheduled for removal'.green, taskId);
  });
}
